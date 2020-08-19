content.system.audio.surface.waves = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    highpassFilter = context.createBiquadFilter(),
    lowpassFilter = context.createBiquadFilter()

  const distance = 4,
    highpassFrequency = 40,
    lowpassDropoffRate = 2.25,
    lowpassMaxFrequency = 1000,
    lowpassMinFrequency = 20,
    waveFrequencyDropoff = 3,
    waveFrequencyRange = 1/4, // 2 octaves
    waveGainDropoff = 3,
    waveMaxFrequency = 5000,
    waveMaxGain = 1,
    waveMinFrequency = 500,
    waveMinGain = 1/2

  // 0 is forward
  const angles = [
    Math.PI * 7/4, // forward right
    Math.PI * 1/4, // forward left
    Math.PI * 3/4, // backward left
    Math.PI * 5/4, // backward right
  ]

  const binaurals = angles.map((angle) => {
    return engine.audio.binaural.create()
      .to(lowpassFilter)
      .update({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      })
  })

  const synths = []

  let wasAbove

  bus.gain.value = engine.utility.fromDb(0)

  lowpassFilter.frequency.value = 0
  lowpassFilter.connect(highpassFilter)

  highpassFilter.frequency.value = highpassFrequency
  highpassFilter.type = 'highpass'
  highpassFilter.connect(bus)

  function createSynths() {
    for (let i = 0; i < binaurals.length; i += 1) {
      const binaural = binaurals[i]

      const synth = engine.audio.synth.createBuffer({
        buffer: engine.audio.buffer.noise.pink(),
      })

      synth.chainAssign('lowpassFilter', context.createBiquadFilter())
      synth.lowpassFilter.frequency.value = engine.const.maxFrequency

      synth.chainAssign('highpassFilter', context.createBiquadFilter())
      synth.highpassFilter.frequency.value = engine.const.minFrequency
      synth.highpassFilter.type = 'highpass'

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

    const isAbove = z >= 0

    if (isAbove && wasAbove) {
      return
    }

    if (isAbove) {
      engine.audio.ramp.exponential(lowpassFilter.frequency, engine.const.maxFrequency, 0.5)
    } else {
      const zRatio = 1 - (z / content.const.lightZone)
      const frequency = engine.utility.lerpExp(lowpassMinFrequency, lowpassMaxFrequency, zRatio, lowpassDropoffRate)
      engine.audio.ramp.set(lowpassFilter.frequency, frequency)
    }

    wasAbove = isAbove
  }

  function updateSynths(z) {
    const isSurface = z >= 0

    synths.forEach((synth, i) => {
      let {x, y, angle} = engine.position.get()

      x += Math.cos(angle + angles[i]) * distance
      y += Math.sin(angle + angles[i]) * distance

      const value = content.system.surface.value(x, y)

      const gain = engine.utility.lerpExp(waveMinGain, waveMaxGain, value, waveGainDropoff),
        maxFrequency = engine.utility.lerpExp(waveMinFrequency, waveMaxFrequency, value, waveFrequencyDropoff),
        minFrequency = isSurface ? maxFrequency * waveFrequencyRange : engine.const.minFrequency

      engine.audio.ramp.set(synth.highpassFilter.frequency, minFrequency)
      engine.audio.ramp.set(synth.lowpassFilter.frequency, maxFrequency)
      engine.audio.ramp.set(synth.param.gain, gain)
    })
  }

  return {
    bus: () => bus,
    import: function ({z}) {
      const isAbove = z >= 0

      if (isAbove) {
        lowpassFilter.frequency.value = engine.const.maxFrequency
      }

      return this
    },
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
      updateSynths(z)
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.surface.waves.update()
})

engine.state.on('import', (data) => content.system.audio.surface.waves.import(data))
