content.audio.underwater.drones = (() => {
  const mix = content.audio.mixer.bus.music.createBus(),
    synthFade = 4,
    synthGain = engine.utility.fromDb(-15)

  const angles = [
    Math.PI * 3/6, // North
    Math.PI * 7/6, // WSW
    Math.PI * 11/6, // ESE
  ]

  const binaurals = angles.map(() => engine.audio.binaural.create().to(mix))

  let frequencyCache = [],
    synths = [],
    wasAbove = false,
    wasBelow = false

  function createSynth(frequency, binaural, instant = false) {
    const amDepth = engine.utility.fromDb(engine.utility.random.float(-6, -4.5))

    const synth = engine.audio.synth.createMod({
      amodDepth: amDepth,
      amodFrequency: engine.utility.random.float(1/16, 1/4),
      carrierGain: 1 - amDepth,
      carrierFrequency: frequency,
      fmodDepth: frequency / 2,
      fmodFrequency: frequency,
      gain: instant ? synthGain : engine.const.zeroGain,
    }).filtered({
      frequency,
    })

    binaural.from(synth.output)

    if (!instant) {
      engine.audio.ramp.linear(synth.param.gain, synthGain, synthFade)
    }

    synth.off = () => {
      engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, synthFade)
      synth.stop(engine.audio.time(synthFade))
    }

    return synth
  }

  function createSynths() {
    const frequencies = content.soundtrack.frequencies()

    for (let i = 0; i < binaurals.length; i += 1) {
      const synth = createSynth(frequencies[i], binaurals[i], true)
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
    const angle = engine.position.getEuler().yaw

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
    const frequencies = content.soundtrack.frequencies()

    synths.forEach((synth, i) => {
      if (frequencies[i] != frequencyCache[i]) {
        synth.off()
        synths[i] = createSynth(frequencies[i], binaurals[i])
        frequencyCache[i] = frequencies[i]
      }
    })
  }

  return {
    import: function () {
      const {z} = engine.position.getVector()

      wasAbove = false
      wasBelow = false

      updateGain(z)

      return this
    },
    update: function () {
      const isMuted = content.audio.mixer.bus.music.isMuted()
      const {z} = engine.position.getVector()

      if (isMuted || z >= content.const.midnightZoneMin) {
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

  content.audio.underwater.drones.update()
})

engine.state.on('import', () => content.audio.underwater.drones.import())
