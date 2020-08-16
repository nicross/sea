content.system.audio.surface.transition = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  let input = context.createGain()

  bus.gain.value = engine.utility.fromDb(-3)

  function kill() {
    const previousInput = input

    engine.audio.ramp.set(previousInput.gain, engine.const.zeroGain)
    engine.loop.once('frame', () => previousInput.disconnect())

    input = context.createGain()
    input.connect(bus)
  }

  function triggerSubmerge() {
    // TODO: Splash down sound
    return

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
      gain: 1,
    }).filtered().connect(input)

    synth.stop(engine.audio.time(1))
  }

  function triggerSurface(velocity) {
    // TODO: Splash up sound
    return

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
      gain: 1,
    }).filtered().connect(input)

    synth.stop(engine.audio.time(1))
  }

  return {
    surface: function (velocity) {
      kill()
      triggerSurface(velocity)
      return this
    },
    underwater: function () {
      kill()
      triggerSubmerge()
      return this
    },
  }
})()

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.movement.on('transition-surface', (velocity) => {
    content.system.audio.surface.transition.surface(velocity)
  })

  content.system.movement.on('transition-underwater', () => {
    content.system.audio.surface.transition.underwater()
  })
})
