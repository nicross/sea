content.audio.mixer = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  function createBus() {
    const input = context.createGain()
    input.connect(bus)
    return input
  }

  function createBypass() {
    return engine.audio.mixer.createBus()
  }

  function createChannel() {
    const bypass = createBypass(),
      sub = createBus()

    return {
      bypass: () => bypass,
      bus: () => sub,
      createBus: () => {
        const input = context.createGain()
        input.connect(sub)
        return input
      },
      createBypass: () => {
        const input = context.createGain()
        input.connect(bypass)
        return input
      },
      setGain: function (value) {
        engine.audio.ramp.set(bypass.gain, value)
        engine.audio.ramp.set(sub.gain, value)
        return this
      },
    }
  }

  return {
    bus: {
      environment: createChannel(),
      misc: createChannel(),
      music: createChannel(),
    },
    createBus,
    createBypass,
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
  }
})()

engine.ready(() => {
  content.scan.on('complete', () => content.audio.mixer.onScanComplete())
  content.scan.on('trigger', () => content.audio.mixer.onScanTrigger())
})
