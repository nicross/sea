content.system.audio.underwater.collision = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter(),
    throttleRate = 1000/10

  // TODO: Reverb send

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-6)
  filter.connect(bus)

  function trigger({
    angle = 0,
    velocity = 0,
    z = 0,
  } = {}) {
    console.log('bang', angle, velocity, z)

    // TODO: Build synth
    // TODO: Position in space
    // TODO: Automate parameters
  }

  return {
    trigger: function (e) {
      const now = performance.now()

      if (now > throttle + throttleRate) {
        trigger(e)
        throttle = now
      }

      return this
    },
  }
})()


// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.movement.on('underwater-collision', (e) => content.system.audio.underwater.collision.trigger(e))
})
