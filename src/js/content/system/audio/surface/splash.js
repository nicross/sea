content.system.audio.surface.splash = (() => {
  const bus = content.system.audio.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter(),
    throttleRate = 1000/10

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-9)
  filter.connect(bus)

  function trigger({
    pan = 0.5,
    size = 0,
    velocity = 0,
  } = {}) {
    const color = engine.utility.lerpExp(100, 1000, velocity, 2.5),
      duration = engine.utility.lerp(1/2, 1, size),
      gain = engine.utility.lerp(1, 1/2, velocity),
      panner = context.createStereoPanner()

    panner.pan.value = engine.utility.lerpRandom([-1, 0], [0, 1], pan)
    panner.connect(filter)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.white(),
      carrierGain: 1/2,
      modDepth: 1/2,
      modFrequency: engine.utility.lerpRandom([4, 8], [10, 20], velocity),
    }).filtered({
      frequency: color,
    }).connect(panner)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  return {
    import: function () {
      if (content.system.movement.isUnderwater()) {
        this.underwater()
      } else {
        this.surface()
      }

      return this
    },
    surface: function () {
      engine.audio.ramp.exponential(filter.frequency, engine.const.maxFrequency, 1/8)
      return this
    },
    trigger: function (e) {
      const now = performance.now()

      if (now > throttle + throttleRate) {
        trigger(e)
        throttle = now
      }

      return this
    },
    underwater: function () {
      engine.audio.ramp.exponential(filter.frequency, 200, 1/8)
      return this
    },
  }
})()

engine.ready(() => {
  content.system.movement.on('surface-splash', (e) => content.system.audio.surface.splash.trigger(e))
  content.system.movement.on('transition-surface', () => content.system.audio.surface.splash.surface())
  content.system.movement.on('transition-underwater', () => content.system.audio.surface.splash.underwater())
})

engine.state.on('import', () => content.system.audio.surface.splash.import())
