content.audio.scan = (() => {
  const bus = content.audio.mixer.bus.misc.createBypass(),
    rootFrequency = engine.utility.midiToFrequency(69)

  bus.gain.value = engine.utility.fromDb(-4.5)

  function honk() {
    const root = rootFrequency

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
      carrierFrequency: rootFrequency / 16,
      carrierType: 'sawtooth',
      modDepth: 0,
      modFrequency: 0,
    }).shaped(
      engine.audio.shape.noise()
    ).filtered({
      frequency: rootFrequency / 4,
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

  function render(results) {
    const now = engine.audio.time(),
      rendered = engine.utility.octree.create()

    // First result
    const first = results.shift()

    if (first && first.isSolid) {
      renderGrain({
        result: first,
        type: 'sawtooth',
        when: now,
      })

      rendered.insert(first)
    }

    // Random directions
    for (const result of results) {
      if (!result.isSolid || rendered.find(result, 1)) {
        continue
      }

      renderGrain({
        result,
        type: 'sine',
        when: now,
      })

      rendered.insert(result)
    }
  }

  function renderGrain({
    result,
    type = 'sine',
    when = 0,
  } = {}) {
    // Adjust arrival time via distance
    when += engine.utility.lerp(0, content.const.scanCooldown - 0.25, result.distanceRatio)

    // Select from notes via z-coordinate
    const detune = engine.utility.lerp(-2400, 2400, result.zRatio),
      frequency = rootFrequency

    // Create synth
    const synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type,
      when,
    }).filtered({
      detune,
      frequency: frequency * (type == 'sawtooth' ? 8 : 2),
    })

    // Position synth in space
    const relative = engine.utility.vector3d.create(result)
      .subtract(engine.position.getVector())
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const binaural = engine.audio.binaural.create({
      ...relative,
    }).from(synth).to(bus)

    // Automate
    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(1, when + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, when + 0.25)

    synth.stop(when + 0.25)

    // Teardown
    const now = engine.audio.time()
    setTimeout(() => binaural.destroy(), (when - now + 0.25) * 1000)
  }

  return {
    complete: function (results) {
      render(results)
      recharge()
      return this
    },
    trigger: function () {
      honk()
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', (results) => content.audio.scan.complete(results))
  content.scan.on('trigger', (e) => content.audio.scan.trigger(e))
})
