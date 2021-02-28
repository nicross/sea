content.system.audio.surface.waves = (() => {
  const buffers = [],
    bus = content.system.audio.createBus(),
    context = engine.audio.context(),
    highpassFilter = context.createBiquadFilter(),
    lowpassFilter = context.createBiquadFilter()

  const distance = 2,
    highpassFrequency = 40,
    lowpassDropoffRate = 3,
    lowpassMaxFrequency = 1000,
    lowpassMinFrequency = 20,
    waveFrequencyDropoff = 1,
    waveFrequencyRange = 1/4, // 2 octaves
    waveGainDropoff = 3,
    waveMaxFrequency = 3000,
    waveMaxGain = 1,
    waveMinFrequency = 750,
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

  for (let i = 0; i < angles.length; i += 1) {
    const buffer = content.system.audio.buffer.pink.create(5)
    buffers.push(buffer)
  }

  bus.gain.value = engine.utility.fromDb(-9)

  lowpassFilter.frequency.value = 0
  lowpassFilter.connect(highpassFilter)

  highpassFilter.frequency.value = highpassFrequency
  highpassFilter.type = 'highpass'
  highpassFilter.connect(bus)

  function createSynths() {
    for (let i = 0; i < binaurals.length; i += 1) {
      const binaural = binaurals[i]

      const synth = engine.audio.synth.createBuffer({
        buffer: buffers[i],
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
    const isAbove = !content.system.movement.isUnderwater()

    if (isAbove && wasAbove) {
      return
    }

    if (isAbove) {
      engine.audio.ramp.exponential(lowpassFilter.frequency, engine.const.maxFrequency, 0.5)
    } else {
      const zRatio = engine.utility.scale(z, content.system.surface.currentHeight(), content.const.lightZone, 1, 0)
      const frequency = engine.utility.lerpExp(lowpassMinFrequency, lowpassMaxFrequency, zRatio, lowpassDropoffRate)
      engine.audio.ramp.set(lowpassFilter.frequency, frequency)
    }

    wasAbove = isAbove
  }

  function updateSynths(z) {
    const isAbove = !content.system.movement.isUnderwater()

    synths.forEach((synth, i) => {
      const angle = engine.position.getEuler().yaw
      let {x, y} = engine.position.getVector()

      x += Math.cos(angle + angles[i]) * distance
      y += Math.sin(angle + angles[i]) * distance

      const surface = content.system.surface.value(x, y),
        value = Math.abs((surface * 2) - 1)

      const height = content.system.surface.toHeight(surface),
        maxFrequency = engine.utility.lerpExp(waveMinFrequency, waveMaxFrequency, value, waveFrequencyDropoff),
        minFrequency = isAbove ? maxFrequency * waveFrequencyRange : engine.const.minFrequency

      let gain = engine.utility.lerpExp(waveMinGain, waveMaxGain, value, waveGainDropoff)

      if (z > height) {
        gain *= engine.utility.clamp(engine.utility.scale(z, height, height + content.const.underwaterTurboMaxVelocity, 1, 0.75), 0.75, 1)
      }

      engine.audio.ramp.set(synth.highpassFilter.frequency, minFrequency)
      engine.audio.ramp.set(synth.lowpassFilter.frequency, maxFrequency)
      engine.audio.ramp.set(synth.param.gain, gain)
    })
  }

  return {
    bus: () => bus,
    import: function () {
      if (!content.system.movement.isUnderwater()) {
        lowpassFilter.frequency.value = engine.const.maxFrequency
      }

      return this
    },
    update: function () {
      const {z} = engine.position.getVector()

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
