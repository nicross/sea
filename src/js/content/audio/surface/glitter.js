content.audio.surface.glitter = (() => {
  const bus = content.audio.mixer.bus.music.createBus(),
    context = engine.audio.context(),
    feedbackDelays = []

  const frequencies = [
    // A2
    33,
    35,
    37,
    40,
    42,
    // A3
    45,
    47,
    49,
    52,
    54,
    // A4
    57,
    59,
    61,
    64,
    66,
    // A5
    69,
    71,
    73,
    76,
    78,
    // A6
    81,
    83,
    85,
    88,
    90,
    // A7
    93,
    95,
    97,
    100,
    102,
  ].map(engine.utility.midiToFrequency)

  const frequencyDropoff = 2.25,
    maxFrequency = engine.utility.midiToFrequency(78),
    minFrequency = engine.utility.midiToFrequency(33)

  let filter,
    previousZ

  swapFilter()
  createFeedbackDelays()

  function calculateGrainChance(z) {
    const isCatchingAir = content.movement.isCatchingAir()

    let chance = content.time.cycle()

    if (isCatchingAir) {
      const height = content.surface.current()
      chance = engine.utility.clamp(engine.utility.scale(z, height, height + content.const.underwaterTurboMaxVelocity, chance, 1), 0, 1)
    }

    return engine.utility.lerp(4/engine.performance.fps(), 1/2, chance)
  }

  function createFeedbackDelays() {
    for (let i = 0; i < 4; i += 1) {
      const feedbackDelay = engine.audio.effect.createFeedbackDelay({
        delay: (i + 1) / 4,
        dry: 1,
        feedback: engine.utility.fromDb(-3),
        wet: engine.utility.fromDb(-3),
      })

      feedbackDelay.param.gain.value = engine.utility.fromDb(-15)
      feedbackDelay.output.connect(filter)
      feedbackDelays.push(feedbackDelay)
    }
  }

  function createGrain(z) {
    let zBias = 1 - ((Math.min(0, z) / content.const.lightZone) ** 2)

    const isCatchingAir = content.movement.isCatchingAir(),
      surface = content.surface.current() / content.surface.max()

    zBias *= surface ** (1/6)

    if (isCatchingAir) {
      const height = content.surface.current()
      zBias = engine.utility.clamp(engine.utility.scale(z, height, height + content.const.underwaterTurboMaxVelocity, zBias, 1), 0, 1)
    }

    const feedbackDelay = engine.utility.choose(feedbackDelays, Math.random()),
      panner = context.createStereoPanner()

    const frequencyRoll = isCatchingAir
      ? (Math.random() * zBias) ** 0.5
      : Math.random() * zBias

    const synth = engine.audio.synth.createSimple({
      frequency: engine.utility.choose(frequencies, frequencyRoll),
    }).connect(panner)

    panner.pan.value = engine.utility.random.float(-1, 1)
    panner.connect(feedbackDelay.input)

    const attack = engine.utility.random.float(1/32, 1/4),
      decay = engine.utility.random.float(1/4, 1)

    let gain = isCatchingAir
      ? engine.utility.fromDb(engine.utility.lerp(-12, -6, frequencyRoll))
      : engine.utility.fromDb(engine.utility.random.float(-12, -6))

    const fadeBelowZ = content.const.midnightZoneMin

    if (z <= fadeBelowZ) {
      gain *= engine.utility.scale(z, fadeBelowZ, content.const.lightZone, 1, 0) ** 0.25
    }

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + attack + decay)

    synth.stop(now + attack + decay)
  }

  function swapFilter() {
    filter = context.createBiquadFilter()
    filter.frequency.value = 0
    filter.connect(bus)
  }

  function teardownFeedbackDelays() {
    for (const feedbackDelay of feedbackDelays) {
      engine.audio.ramp.linear(feedbackDelay.param.gain, engine.const.zeroGain, 1/4)
    }

    feedbackDelays.length = 0
  }

  function updateFilter(z) {
    if (previousZ === z) {
      return
    }

    previousZ = z

    if (!content.movement.isUnderwater()) {
      return engine.audio.ramp.set(filter.frequency, engine.const.maxFrequency)
    }

    const zRatio = engine.utility.scale(z, content.surface.current(), content.const.lightZone, 1, 0)
    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, zRatio, frequencyDropoff)

    engine.audio.ramp.set(filter.frequency, frequency)
  }

  return {
    reset: function () {
      swapFilter()
      teardownFeedbackDelays()
      createFeedbackDelays()

      previousZ = null

      return this
    },
    update: function () {
      const isMuted = content.audio.mixer.bus.music.isMuted()
      const {z} = engine.position.getVector()

      if (isMuted || z < content.const.lightZone) {
        return this
      }

      updateFilter(z)

      if (Math.random() <= calculateGrainChance(z)) {
        createGrain(z)
      }
    },
  }
})()

engine.loop.on('frame', () => {
  if (content.scan.isCooldown()) {
    return
  }

  content.audio.surface.glitter.update()
})

engine.state.on('reset', () => content.audio.surface.glitter.reset())
