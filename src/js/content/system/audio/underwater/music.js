content.system.audio.underwater.music = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    reverbMix = context.createGain()

  reverbMix.gain.value = engine.utility.fromDb(-6)
  bus.connect(reverbMix)

  return {
    activate: function () {
      content.system.audio.reverb.from(reverbMix)
      return this
    },
    bus: () => bus,
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
  }
})()

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.audio.underwater.music.activate()

  // TODO: Listen to scan complete/recharge events for ducking
})
