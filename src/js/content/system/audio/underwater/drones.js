content.system.audio.underwater.drones = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    mix = context.createGain()

  const angles = [
    Math.PI * 3/6, // North
    Math.PI * 7/6, // WSW
    Math.PI * 11/6, // ESE
  ]

  const binaurals = angles.map(() => engine.audio.binaural.create().to(mix))

  const frequencyRampDuration = 30

  let frequencyCache = [],
    synths = [],
    wasAbove = false,
    wasBelow = false

  mix.connect(bus)

  function createSynths() {
    const frequencies = content.system.soundtrack.frequencies()

    for (let i = 0; i < binaurals.length; i += 1) {
      const binaural = binaurals[i]

      const synth = engine.audio.synth.createAm({
        carrierGain: 1,
        carrierFrequency: frequencies[i],
        gain: engine.utility.fromDb(-21),
        modDepth: 0,
        modFrequency: 0,
      })

      binaural.from(synth.output)
      synths.push(synth)
    }

    frequencyCache = frequencies
  }

  function destroySynths() {
    synths.forEach((synth) => {
      synth.stop()
      synth.output.disconnect()
    })

    synths.length = 0
  }

  function updateBinaurals() {
    const {angle} = engine.position.get()

    binaurals.forEach((binaural, i) => {
      binaural.update({
        x: Math.cos(angles[i] - angle),
        y: Math.sin(angles[i] - angle),
      })
    })
  }

  function updateGain(z) {
    const isAbove = z > content.const.midnightZoneMin,
      isBelow = z <= content.const.midnightZoneMax

    if ((isAbove && wasAbove) || (isBelow && wasBelow)) {
      return
    }

    if (isAbove) {
      engine.audio.ramp.set(mix.gain, engine.const.zeroGain)
    } else if (isBelow) {
      engine.audio.ramp.set(mix.gain, 1)
    } else {
      const zScaled = engine.utility.scale(z, content.const.midnightZoneMin, content.const.midnightZoneMax, 0, 1)
      const gain = engine.utility.lerpExp(engine.const.zeroGain, 1, zScaled, 3)
      engine.audio.ramp.set(mix.gain, gain)
    }

    wasAbove = isAbove
    wasBelow = isBelow
  }

  function updateSynths() {
    const frequencies = content.system.soundtrack.frequencies()

    synths.forEach((synth, i) => {
      if (frequencies[i] != frequencyCache[i]) {
        engine.audio.ramp.exponential(synth.param.frequency, frequencies[i], frequencyRampDuration)
        frequencyCache[i] = frequencies[i]
      }

      // TODO: Update AM frequency/depth
    })
  }

  return {
    import: function ({z}) {
      wasAbove = false
      wasBelow = false
      updateGain(z)
      return this
    },
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
    update: function () {
      const z = content.system.z.get()

      if (z >= content.const.midnightZoneMin) {
        if (synths.length) {
          destroySynths()
        }
        return this
      }

      if (!synths.length) {
        createSynths()
      }

      updateBinaurals()
      updateGain(z)
      updateSynths()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.underwater.drones.update()
})

engine.state.on('import', (data) => content.system.audio.underwater.drones.import(data))
