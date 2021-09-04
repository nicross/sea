content.audio.mixer = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    ducker = context.createGain(),
    killswitch = context.createGain(),
    killswitchBypass = context.createGain()

  ducker.connect(killswitch)
  killswitch.connect(bus)
  killswitchBypass.connect(bus)

  function createBus() {
    const input = context.createGain()
    input.connect(ducker)
    return input
  }

  function createBypass() {
    const input = context.createGain()
    input.connect(killswitchBypass)
    return input
  }

  function createChannel() {
    const bypass = createBypass(),
      sub = createBus()

    let isMuted = false

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
      isMuted: () => isMuted,
      setGain: function (value) {
        isMuted = value <= engine.const.zeroGain

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
    killswitch: function (state = true) {
      const gain = state ? 1 : 0

      engine.audio.ramp.set(killswitch.gain, gain)
      engine.audio.ramp.set(killswitchBypass.gain, gain)

      return this
    },
    onScanComplete: function () {
      const duration = content.const.scanCooldown,
        now = engine.audio.time()

      ducker.gain.setValueAtTime(1/64, now + duration/2)
      ducker.gain.exponentialRampToValueAtTime(1, now + duration)

      return this
    },
    onScanTrigger: function () {
      engine.audio.ramp.exponential(ducker.gain, 1/64, 1/2)
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', () => content.audio.mixer.onScanComplete())
  content.scan.on('trigger', () => content.audio.mixer.onScanTrigger())
})
