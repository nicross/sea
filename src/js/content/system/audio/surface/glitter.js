// TODO: A noise field that gives glitter a 2D geometry

content.system.audio.surface.glitter = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    feedbackDelays = [],
    filter = context.createBiquadFilter()

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

  const grainChance = 1/24

  const frequencyDropoff = 2.25,
    maxFrequency = engine.utility.midiToFrequency(78),
    minFrequency = engine.utility.midiToFrequency(33)

  let wasAbove

  for (let i = 0; i < 4; i += 1) {
    const feedbackDelay = engine.audio.effect.createFeedbackDelay({
      delay: (i + 1) / 4,
      dry: 1,
      feedback: engine.utility.fromDb(-3),
      wet: engine.utility.fromDb(-3),
    })

    feedbackDelay.param.gain.value = engine.utility.fromDb(-18)
    feedbackDelay.output.connect(filter)
    feedbackDelays.push(feedbackDelay)
  }

  filter.frequency.value = 0
  filter.connect(bus)

  function createGrain(z) {
    let zBias = 1 - ((Math.min(0, z) / content.const.lightZone) ** 2)

    const {x, y} = engine.position.get()
    const surface = content.system.surface.value(x, y)
    zBias *= surface ** 0.5

    if (content.system.movement.isCatchingAir()) {
      const height = content.system.surface.height(x, y)
      zBias = engine.utility.clamp(engine.utility.scale(z, height, height + content.const.underwaterTurboMaxVelocity, zBias, 1), 0, 1) ** 0.5
    }

    const feedbackDelay = engine.utility.choose(feedbackDelays, Math.random()),
      panner = context.createStereoPanner()

    const synth = engine.audio.synth.createSimple({
      frequency: engine.utility.choose(frequencies, Math.random() * zBias),
    }).connect(panner)

    panner.pan.value = engine.utility.random.float(-1, 1)
    panner.connect(feedbackDelay.input)

    const attack = engine.utility.random.float(1/32, 1/4),
      decay = engine.utility.random.float(1/4, 1),
      gain = engine.utility.fromDb(engine.utility.random.float(-12, -6))

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + attack + decay)

    synth.stop(now + attack + decay)
  }

  function updateFilter(z) {
    z = Math.min(0, z)

    const isAbove = z >= 0

    if (isAbove && wasAbove) {
      return
    }

    if (isAbove) {
      engine.audio.ramp.exponential(filter.frequency, engine.const.maxFrequency, 0.5)
    } else {
      const zRatio = 1 - (z / content.const.lightZone)
      const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, zRatio, frequencyDropoff)
      engine.audio.ramp.set(filter.frequency, frequency)
    }
  }

  return {
    bus: () => bus,
    import: function ({z}) {
      const isAbove = z >= 0

      if (isAbove) {
        filter.frequency.value = engine.const.maxFrequency
      }

      return this
    },
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
    update: function () {
      const z = content.system.z.get()

      if (z < content.const.lightZone) {
        return this
      }

      updateFilter(z)

      if (Math.random() * grainChance) {
        createGrain(z)
      }
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.surface.glitter.update()
})

engine.state.on('import', (data) => content.system.audio.surface.glitter.import(data))
