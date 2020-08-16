content.system.audio.surface.waves = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    highpassFilter = context.createBiquadFilter(),
    lowpassFilter = context.createBiquadFilter()

  const distance = 2.5,
    highpassFrequency = 60,
    lowpassDropoffRate = 2,
    lowpassMaxFrequency = 1000,
    lowpassMinFrequency = 40,
    waveFrequencyDropoff = 2.5,
    waveGainDropoff = 2.5,
    waveMaxFrequency = engine.const.maxFrequency / 2,
    waveMaxGain = 1/2,
    waveMinFrequency = engine.const.maxFrequency / 20,
    waveMinGain = 1/4

  const coordinates = [
    {x: distance, y: distance},
    {x: -distance, y: distance},
    {x: -distance, y: -distance},
    {x: distance, y: -distance},
  ]

  const binaurals = coordinates.map((position) => {
    return engine.audio.binaural.create()
      .update(position)
      .to(lowpassFilter)
  })

  const synths = []

  lowpassFilter.frequency.value = 0
  lowpassFilter.connect(highpassFilter)

  highpassFilter.frequency.value = highpassFrequency
  highpassFilter.type = 'highpass'
  highpassFilter.connect(bus)

  function createSynths() {
    for (let i = 0; i < 4; i += 1) {
      const binaural = binaurals[i]

      const synth = engine.audio.synth.createBuffer({
        buffer: engine.audio.buffer.noise.pink(),
      }).filtered()

      binaural.from(synth)
      synths.push(synth)
    }
  }

  function destroySynths() {
    synths.forEach((synth) => {
      synth.stop()
      synth.output.disconnect()
    })

    synths.length = 0
  }

  function updateLowpassFilter(z) {
    z = Math.min(0, z)

    const zRatio = 1 - (z / content.const.lightZone)

    const frequency = z >= 0
      ? engine.const.maxFrequency
      : engine.utility.lerpExp(lowpassMinFrequency, lowpassMaxFrequency, zRatio, lowpassDropoffRate)

    engine.audio.ramp.set(lowpassFilter.frequency, frequency)
  }

  function updateSynths() {
    synths.forEach((synth, i) => {
      let {x, y, angle} = engine.position.get()

      x += Math.cos(angle) * coordinates[i].x
      y += Math.cos(angle) * coordinates[i].y

      const value = content.system.surface.value(x, y)

      const frequency = engine.utility.lerpExp(waveMinFrequency, waveMaxFrequency, value, waveFrequencyDropoff),
        gain = engine.utility.lerpExp(waveMinGain, waveMaxGain, value, waveGainDropoff)

      engine.audio.ramp.set(synth.filter.frequency, frequency)
      engine.audio.ramp.set(synth.param.gain, gain)
    })
  }

  return {
    bus: () => bus,
    update: function () {
      const z = content.system.z.get()

      if (z < content.const.lightZone) {
        if (synths.length) {
          destroySynths()
        }
        return this
      }

      if (!synths.length) {
        createSynths()
      }

      updateLowpassFilter(z)
      updateSynths()
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.surface.waves.update()
})
