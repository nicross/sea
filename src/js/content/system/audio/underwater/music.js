content.system.audio.underwater.music = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    reverbMix = context.createGain()

  let gain = 1

  bus.gain.value = gain
  bus.connect(reverbMix)

  // TODO: Turn notes into synth pads
  // 4s attack and decay, they'll naturally crossfade
  // random am depth/frequency with each note, try 1/prime seconds

  return {
    activate: function () {
      content.system.audio.reverb.from(reverbMix)
      return this
    },
    bus: () => bus,
    duck: function () {
      engine.audio.ramp.exponential(bus.gain, gain/32, 1/2)
      return this
    },
    unduck: function () {
      const duration = content.const.scanCooldown/1000,
        now = engine.audio.time()

      bus.gain.setValueAtTime(gain/32, now + duration/2)
      bus.gain.exponentialRampToValueAtTime(gain, now + duration)

      return this
    },
    setGain: function (value) {
      gain = value
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
  }
})()

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.audio.underwater.music.activate()
  content.system.scan.on('trigger', () => content.system.audio.underwater.music.duck())
  content.system.scan.on('complete', () => content.system.audio.underwater.music.unduck())
})
