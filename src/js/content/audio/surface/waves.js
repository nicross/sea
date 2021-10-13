content.audio.surface.waves = (() => {
  const buffers = [],
    bus = content.audio.mixer.bus.environment.createBus(),
    context = engine.audio.context(),
    highpassFilter = context.createBiquadFilter(),
    lowpassFilter = context.createBiquadFilter()

  const distance = 5,
    highpassFrequency = 40,
    lowpassDropoffRate = 2,
    lowpassMaxFrequency = 1000,
    lowpassMinFrequency = 20,
    waveFrequencyDropoff = 1,
    waveFrequencyRange = 1/4, // 2 octaves
    waveGainDropoff = 3,
    waveMaxFrequency = 5000,
    waveMaxGain = 1,
    waveMinFrequency = 500,
    waveMinGain = 1/4

  // 0 is forward
  const angles = [
    0, // center
    Math.PI * 7/4, // forward right
    Math.PI * 1/4, // forward left
    Math.PI * 3/4, // backward left
    Math.PI * 5/4, // backward right
  ]

  const binaurals = angles.map((angle) => {
    return engine.audio.binaural.create()
      .to(lowpassFilter)
      .update({
        x: angle ? Math.cos(angle) * distance : 0,
        y: angle ? Math.sin(angle) * distance : 0,
      })
  })

  const synths = []

  let wasAbove

  for (let i = 0; i < angles.length; i += 1) {
    const buffer = content.audio.buffer.pink.create(5)
    buffers.push(buffer)
  }

  bus.gain.value = engine.utility.fromDb(-7.5)

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

      // Fade in
      synth.chainAssign('fader', context.createGain())
      synth.fader.gain.value = engine.const.zeroGain
      engine.audio.ramp.linear(synth.fader.gain, 1, 1/32)
    }
  }

  function destroySynths() {
    synths.forEach((synth) => {
      // Fade out
      engine.audio.ramp.linear(synth.fader.gain, engine.const.zeroGain, 1/32)
      synth.stop(engine.audio.time(1/32))
    })

    synths.length = 0
  }

  function updateLowpassFilter(z) {
    const isAbove = !content.movement.isUnderwater()

    if (isAbove && wasAbove) {
      return
    }

    if (isAbove) {
      engine.audio.ramp.exponential(lowpassFilter.frequency, engine.const.maxFrequency, 0.5)
    } else {
      const zRatio = engine.utility.scale(z, content.surface.current(), content.const.lightZone, 1, 0)
      const frequency = engine.utility.lerpExp(lowpassMinFrequency, lowpassMaxFrequency, zRatio, lowpassDropoffRate)
      engine.audio.ramp.set(lowpassFilter.frequency, frequency)
    }

    wasAbove = isAbove
  }

  function updateSynths(z) {
    const isAbove = !content.movement.isUnderwater()

    synths.forEach((synth, i) => {
      const isCenter = angles[i] == 0
      let {x, y} = engine.position.getVector()

      if (!isCenter) {
        const angle = engine.position.getEuler().yaw + angles[i]
        x += Math.cos(angle) * distance
        y += Math.sin(angle) * distance
      }

      const height = content.surface.value(x, y),
        ratio = height / content.surface.max()

      const maxFrequency = engine.utility.lerpExp(waveMinFrequency, waveMaxFrequency, ratio, waveFrequencyDropoff),
        minFrequency = isAbove ? maxFrequency * waveFrequencyRange : engine.const.minFrequency

      let gain = engine.utility.lerpExp(waveMaxGain, waveMinGain, ratio, waveGainDropoff)

      if (z > height) {
        gain *= engine.utility.clamp(engine.utility.scale(z, height, height + content.const.underwaterTurboMaxVelocity, 1, 0.75), 0.75, 1)
      }

      if (isCenter) {
        gain /= 32
      }

      engine.audio.ramp.set(synth.highpassFilter.frequency, minFrequency)
      engine.audio.ramp.set(synth.lowpassFilter.frequency, maxFrequency)
      engine.audio.ramp.set(synth.param.gain, gain)
    })
  }

  return {
    bus: () => bus,
    import: function () {
      if (!content.movement.isUnderwater()) {
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

  content.audio.surface.waves.update()
})

engine.state.on('import', (data) => content.audio.surface.waves.import(data))
