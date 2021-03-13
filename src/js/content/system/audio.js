content.system.audio = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  return {
    buffer: {},
    bus: () => bus,
    createBus: () => {
      const input = context.createGain()
      input.connect(bus)
      return input
    },
    createBypass: () => engine.audio.mixer.createBus(),
    import: function () {
      engine.audio.mixer.master.param.lowpass.frequency.value = engine.const.minFrequency
      engine.audio.ramp.exponential(engine.audio.mixer.master.param.lowpass.frequency, engine.const.maxFrequency, 2)
      return this
    },
    onScanComplete: function () {
      const duration = content.const.scanCooldown/1000,
        now = engine.audio.time()

      bus.gain.setValueAtTime(1/32, now + duration/2)
      bus.gain.exponentialRampToValueAtTime(1, now + duration)

      return this
    },
    onScanTrigger: function () {
      engine.audio.ramp.exponential(bus.gain, 1/32, 1/2)
      return this
    },
    surface: {},
    underwater: {},
  }
})()

engine.ready(() => {
  content.system.scan.on('complete', () => content.system.audio.onScanComplete())
  content.system.scan.on('trigger', () => content.system.audio.onScanTrigger())
})
