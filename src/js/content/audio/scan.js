content.audio.scan = (() => {
  const bus = content.audio.mixer.bus.misc.createBypass()
  bus.gain.value = engine.utility.fromDb(-4.5)

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

    content.audio.reverb.from(synth.output)

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

    const attack = now + content.const.scanCooldown/2,
      release = now + content.const.scanCooldown

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(1/32, attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, release)

    synth.param.mod.depth.setValueAtTime(0, now)
    synth.param.mod.depth.linearRampToValueAtTime(5, release)

    synth.param.mod.frequency.setValueAtTime(0, now)
    synth.param.mod.frequency.linearRampToValueAtTime(16, release)

    synth.param.frequency.setValueAtTime(engine.utility.midiToFrequency(21), now)
    synth.param.frequency.exponentialRampToValueAtTime(engine.utility.midiToFrequency(28), release)

    synth.stop(release)
  }

  function render(scan) {
    const delay = 0.25,
      duration = content.const.scanCooldown - delay - 0.25,
      now = engine.audio.time(),
      offset = duration/20

    // up
    renderGrain({
      note: 93,
      scan: scan.up,
      type: 'sawtooth',
      when: now + delay,
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
      offset,
      when: now + delay + (3 * offset),
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
      offset,
      when: now + delay + (8 * offset),
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
      offset,
      when: now + delay + (13 * offset),
    })

    // down
    renderGrain({
      note: 45,
      scan: scan.down,
      type: 'sawtooth',
      when: now + delay + (20 * offset),
    })
  }

  function renderGrain({
    note = 0,
    scan,
    type = 'sine',
    when = 0,
  } = {}) {
    if (!scan || !scan.isSolid) {
      return
    }

    const frequency = engine.utility.midiToFrequency(note)

    const synth = engine.audio.synth.createSimple({
      frequency,
      type,
      when,
    }).filtered({
      frequency: frequency * (type == 'sawtooth' ? 4 : 2),
    })

    const relative = engine.utility.vector3d.create(scan)
      .subtract(engine.position.getVector())
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const binaural = engine.audio.binaural.create({
      ...relative.scale(0.5),
    }).from(synth).to(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(1, when + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, when + 0.25)

    synth.stop(when + 0.25)

    const now = engine.audio.time()
    setTimeout(() => binaural.destroy(), (when - now + 0.5) * 1000)
  }

  function renderGroup(group = [], {octave, offset, when} = {}) {
    octave *= 12

    renderGrain({
      note: 74 + octave,
      scan: group[0],
      when: when,
    })

    renderGrain({
      note: 72 + octave,
      scan: group[1],
      type: 'triangle',
      when: when + offset,
    })

    renderGrain({
      note: 69 + octave,
      scan: group[2],
      type: 'sawtooth',
      when: when + (2 * offset),
    })

    renderGrain({
      note: 67 + octave,
      scan: group[3],
      type: 'triangle',
      when: when + (3 * offset),
    })

    renderGrain({
      note: 65 + octave,
      scan: group[4],
      when: when + (4 * offset),
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
  content.scan.on('complete', (scan) => content.audio.scan.complete(scan))
  content.scan.on('trigger', (e) => content.audio.scan.trigger(e))
})
