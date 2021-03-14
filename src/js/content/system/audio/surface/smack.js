content.system.audio.surface.smack = (() => {
  const bus = content.system.audio.mixer.bus.environment.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter(),
    throttleRate = 1000/10

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-6)
  filter.connect(bus)

  function trigger({
    gravity = 0,
    lateral = 0,
    pan = 0.5,
  } = {}) {
    const isTurbo = content.system.movement.isTurbo()

    const color = engine.utility.lerpExp(200, 4000, gravity, 3),
      duration = engine.utility.lerpExp(1/4, 4, gravity, 3),
      gain = engine.utility.lerp(isTurbo ? 1/2 : 1/8, 1, gravity),
      modDepth = engine.utility.lerp(0, 1/3, gravity),
      panner = context.createStereoPanner()

    panner.pan.value = pan == 0.5
      ? 0
      : engine.utility.lerpRandom([-1, 0], [0, 1], pan)

    panner.connect(filter)

    // Simulate traveling away from it
    const fadeDuration = engine.utility.lerp(duration, 1/4, lateral)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.brown(),
      carrierGain: 1 - modDepth,
      modDepth: modDepth,
    }).filtered().connect(panner)

    const now = engine.audio.time()

    synth.filter.frequency.setValueAtTime(200, now)
    synth.filter.frequency.exponentialRampToValueAtTime(color, now + duration)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + fadeDuration)

    synth.param.mod.frequency.setValueAtTime(27.5, now)
    synth.param.mod.frequency.exponentialRampToValueAtTime(3.4375, now + duration)

    synth.stop(now + fadeDuration)
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
      engine.audio.ramp.exponential(filter.frequency, 500, 1/8)
      return this
    },
  }
})()

engine.ready(() => {
  content.system.movement.on('surface-smack', (e) => content.system.audio.surface.smack.trigger(e))
  content.system.movement.on('transition-surface', () => content.system.audio.surface.smack.surface())
  content.system.movement.on('transition-underwater', () => content.system.audio.surface.smack.underwater())
})

engine.state.on('import', () => content.system.audio.surface.smack.import())
