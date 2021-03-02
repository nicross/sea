content.system.audio.music = (() => {
  const bus = content.system.audio.createBus(),
    context = engine.audio.context()

  return {
    bus: () => bus,
    createBus: () => {
      const input = context.createGain()
      input.connect(bus)
      return input
    },
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
  }
})()
