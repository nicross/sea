content.system.audio.scan = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  bus.gain.value = engine.utility.fromDb(-6)

  function honk() {
    const root = engine.utility.midiToFrequency(69)

    const synth = engine.audio.synth.createFm({
      carrierFrequency: root,
      modDepth: root / 2,
      modFrequency: root * 2,
      modType: 'square',
    }).connect(bus)

    content.system.reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)

    synth.stop(now + 0.5)
  }

  function recharge() {
    const synth = engine.audio.synth.createFm({
      carrierFrequency: engine.utility.midiToFrequency(33),
      carrierType: 'square',
      modDepth: 0,
      modFrequency: 0,
    }).filtered({
      frequency: engine.utility.midiToFrequency(45),
    }).connect(bus)

    const now = engine.audio.time()

    const attack = now + (content.const.scanCooldown / 1000) - 1/32,
      release = now + (content.const.scanCooldown / 1000)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1/4, attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, release)

    synth.param.mod.depth.setValueAtTime(0, now)
    synth.param.mod.depth.linearRampToValueAtTime(5, release)

    synth.param.mod.frequency.setValueAtTime(0, now)
    synth.param.mod.frequency.linearRampToValueAtTime(16, release)

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
      scan.forwardLeftUp,
      scan.forwardUp,
      scan.forwardRightUp,
      scan.rightUp,
    ], {
      octave: 1,
      when: engine.audio.time(0.75),
    })

    // level
    renderGroup([
      scan.left,
      scan.forwardLeft,
      scan.forward,
      scan.forwardRight,
      scan.right,
    ], {
      octave: 0,
      when: engine.audio.time(1),
    })

    // down
    renderGroup([
      scan.leftDown,
      scan.forwardLeftDown,
      scan.forwardDown,
      scan.forwardRightDown,
      scan.rightDown,
    ], {
      octave: -1,
      when: engine.audio.time(1.25),
    })

    // down
    renderGrain({
      note: 45,
      pan: 0,
      value: scan.down,
      when: engine.audio.time(1.5),
    })
  }

  function renderGrain({
    note = 0,
    pan = 0,
    value = 0,
    when = 0,
  } = {}) {
    if (value == -1) {
      return
    }

    const gain = (1 - value) ** 4,
      panner = context.createStereoPanner()

    when += value / 4

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
      value: group[0],
      when,
    })

    renderGrain({
      note: 67 + octave,
      pan: -0.5,
      value: group[1],
      when,
    })

    renderGrain({
      note: 69 + octave,
      pan: 0,
      value: group[2],
      when,
    })

    renderGrain({
      note: 64 + octave,
      pan: 0.5,
      value: group[3],
      when,
    })

    renderGrain({
      note: 60 + octave,
      pan: 1,
      value: group[4],
      when,
    })
  }

  return {
    trigger: function (scan) {
      honk()
      render(scan)
      recharge()
      return this
    },
  }
})()
