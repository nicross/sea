content.system.audio.underwater.music = (() => {
  const bus = content.system.audio.createBus()

  return {
    bus: () => bus,
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
  }
})()
