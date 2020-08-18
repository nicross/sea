content.system.audio.surface.smack = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter()

  bus.gain.value = engine.utility.fromDb(-6)
  filter.connect(bus)

  function trigger({velocity}) {
    const color = engine.utility.lerpExp(200, 1000, velocity),
      duration = engine.utility.lerpExp(1/4, 3, velocity),
      gain = engine.utility.lerp(1/2, 1, velocity),
      panner = context.createStereoPanner()

    // Position based on turning
    const movement = engine.movement.get(),
      rotation = engine.utility.scale(-movement.rotation, -engine.const.movementMaxRotation, engine.const.movementMaxRotation, 0, 1)

    panner.pan.value = rotation == 0.5
      ? 0
      : engine.utility.clamp(engine.utility.lerpRandom([-1, 0], [0, 1], rotation), -1, 1)

    panner.connect(filter)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.pink(),
      carrierGain: 7/8,
      modDepth: 1/8,
    }).filtered({
      frequency: color,
    }).connect(panner)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.param.mod.frequency.setValueAtTime(20, now)
    synth.param.mod.frequency.exponentialRampToValueAtTime(2, now + duration)

    synth.stop(now + duration)
  }

  return {
    import: function ({z}) {
      if (z >= 0) {
        this.surface()
      } else {
        this.underwater()
      }

      return this
    },
    surface: function () {
      engine.audio.ramp.exponential(filter.frequency, engine.const.maxFrequency, 1/8)
      return this
    },
    trigger: function (e) {
      trigger(e)
      return this
    },
    underwater: function () {
      engine.audio.ramp.exponential(filter.frequency, 200, 1/8)
      return this
    },
  }
})()

engine.state.on('import', (state) => content.system.audio.surface.smack.import(state))

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.movement.on('surface-smack', (e) => content.system.audio.surface.smack.trigger(e))
  content.system.movement.on('transition-surface', () => content.system.audio.surface.smack.surface())
  content.system.movement.on('transition-underwater', () => content.system.audio.surface.smack.underwater())
})
