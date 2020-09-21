content.system.audio.scan = (() => {
  const bus = content.system.audio.createBypass(),
    context = engine.audio.context()

  bus.gain.value = engine.utility.fromDb(-3)

  function honk(isForward = false) {
    const root = isForward
      ? engine.utility.midiToFrequency(69)
      : engine.utility.midiToFrequency(64)

    const synth = engine.audio.synth.createFm({
      carrierFrequency: root,
      modDepth: root / 2,
      modFrequency: root * 2,
      modType: 'square',
    }).connect(bus)

    content.system.audio.reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1/2, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)

    synth.stop(now + 0.5)
  }

  function recharge() {
    const synth = engine.audio.synth.createFm({
      carrierFrequency: engine.utility.midiToFrequency(21),
      carrierType: 'sawtooth',
      modDepth: 0,
      modFrequency: 0,
    }).shaped(
      engine.audio.shape.noise()
    ).filtered({
      frequency: engine.utility.midiToFrequency(45),
    }).connect(bus)

    const now = engine.audio.time()

    const attack = now + (content.const.scanCooldown / 1000) - 1/32,
      release = now + (content.const.scanCooldown / 1000)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(1/32, attack)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, release)

    synth.param.mod.depth.setValueAtTime(0, now)
    synth.param.mod.depth.linearRampToValueAtTime(5, release)

    synth.param.mod.frequency.setValueAtTime(0, now)
    synth.param.mod.frequency.linearRampToValueAtTime(16, release)

    synth.param.frequency.setValueAtTime(engine.utility.midiToFrequency(21), now)
    synth.param.frequency.exponentialRampToValueAtTime(engine.utility.midiToFrequency(28), release)

    synth.stop(release)
  }

  function render(scan) {
    // up
    renderGrain({
      note: 89,
      pan: 0,
      value: scan.up,
      when: engine.audio.time(0.5),
    })

    // up
    renderGroup([
      scan.leftUp,
      scan.forwardLeftUp || scan.reverseLeftUp,
      scan.forwardUp || scan.reverseUp,
      scan.forwardRightUp || scan.reverseRightUp,
      scan.rightUp,
    ], {
      octave: 1,
      when: engine.audio.time(0.75),
    })

    // level
    renderGroup([
      scan.left,
      scan.forwardLeft || scan.reverseLeft,
      scan.forward || scan.reverse,
      scan.forwardRight || scan.reverseRight,
      scan.right,
    ], {
      octave: 0,
      when: engine.audio.time(1),
    })

    // down
    renderGroup([
      scan.leftDown,
      scan.forwardLeftDown || scan.reverseLeftDown,
      scan.forwardDown || scan.reverseDown,
      scan.forwardRightDown || scan.reverseRightDown,
      scan.rightDown,
    ], {
      octave: -1,
      when: engine.audio.time(1.25),
    })

    // down
    renderGrain({
      note: 45,
      pan: 0,
      scan: scan.down,
      when: engine.audio.time(1.5),
    })
  }

  function renderGrain({
    note = 0,
    pan = 0,
    scan,
    when = 0,
  } = {}) {
    if (!scan || !scan.isSolid) {
      return
    }

    const gain = engine.utility.distanceToPower(scan.distance ** 0.5),
      panner = context.createStereoPanner()

    when += scan.distance / content.const.underwaterSpeedOfSound

    const synth = engine.audio.synth.createSimple({
      frequency: engine.utility.midiToFrequency(note),
      when,
    }).connect(panner)

    panner.pan.value = pan
    panner.connect(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(gain, when + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, when + 0.5)

    synth.stop(when + 0.5)
  }

  function renderGroup(group = [], {octave, when} = {}) {
    octave *= 12

    renderGrain({
      note: 62 + octave,
      pan: -1,
      scan: group[0],
      when,
    })

    renderGrain({
      note: 67 + octave,
      pan: -0.5,
      scan: group[1],
      when,
    })

    renderGrain({
      note: 69 + octave,
      pan: 0,
      scan: group[2],
      when,
    })

    renderGrain({
      note: 64 + octave,
      pan: 0.5,
      scan: group[3],
      when,
    })

    renderGrain({
      note: 60 + octave,
      pan: 1,
      scan: group[4],
      when,
    })
  }

  return {
    complete: function (scan) {
      render(scan)
      recharge()
      return this
    },
    trigger: function ({
      forward = false,
    } = {}) {
      honk(forward)
      return this
    },
  }
})()

engine.ready(() => {
  content.system.scan.on('complete', (scan) => content.system.audio.scan.complete(scan))
  content.system.scan.on('trigger', (e) => content.system.audio.scan.trigger(e))
})
