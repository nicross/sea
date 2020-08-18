content.system.audio.surface.smack = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter()

  bus.gain.value = engine.utility.fromDb(-6)
  filter.connect(bus)

  function trigger({velocity}) {
    const color = engine.utility.lerpExp(100, 5000, velocity),
      duration = engine.utility.lerp(1/4, 1, velocity),
      gain = engine.utility.lerp(1/2, 1, velocity)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
    }).filtered({
      frequency: color,
    }).connect(filter)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

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
