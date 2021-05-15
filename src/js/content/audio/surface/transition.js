content.audio.surface.transition = (() => {
  const bus = content.audio.mixer.bus.environment.createBus(),
    context = engine.audio.context()

  let input = context.createGain()
  input.connect(bus)

  bus.gain.value = engine.utility.fromDb(-9)

  function kill() {
    const previousInput = input

    engine.audio.ramp.set(previousInput.gain, engine.const.zeroGain)
    engine.loop.once('frame', () => previousInput.disconnect())

    input = context.createGain()
    input.connect(bus)
  }

  function triggerSubmerge(velocity) {
    const duration = engine.utility.scale(velocity, 0, -content.const.underwaterTurboMaxVelocity, 1, 2),
      frequency = engine.utility.scale(velocity, 0, -content.const.underwaterTurboMaxVelocity, 1000, 2500)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
      gain: 1,
    }).filtered().connect(input)

    const now = engine.audio.time()

    synth.filter.frequency.setValueAtTime(frequency, now)
    synth.filter.frequency.exponentialRampToValueAtTime(100, now + duration)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(1/4, now + engine.const.zeroTime)
    synth.param.gain.linearRampToValueAtTime(1, now + (duration / 2))
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  function triggerSurface(velocity) {
    const duration = engine.utility.lerp(1, 2, velocity),
      frequency = engine.utility.lerp(1000, 2500, velocity)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
      gain: 1,
    }).filtered().connect(input)

    const now = engine.audio.time()

    synth.filter.frequency.setValueAtTime(100, now)
    synth.filter.frequency.exponentialRampToValueAtTime(frequency, now + (duration / 2))

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(1, now + engine.const.zeroTime)
    synth.param.gain.linearRampToValueAtTime(1/4, now + (duration / 2))
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  return {
    surface: function (velocity) {
      kill()
      triggerSurface(velocity)
      return this
    },
    underwater: function (velocity) {
      kill()
      triggerSubmerge(velocity)
      return this
    },
  }
})()

engine.ready(() => {
  content.movement.on('transition-surface', (velocity) => content.audio.surface.transition.surface(velocity))
  content.movement.on('transition-underwater', (velocity) => content.audio.surface.transition.underwater(velocity))
})
