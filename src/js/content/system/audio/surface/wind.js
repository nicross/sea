content.system.audio.surface.wind = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = engine.audio.mixer.createBus()

  const frequencyDropoff = 2,
    gain = engine.utility.fromDb(-6),
    maxFrequency = 80,
    minFrequency = 20

  let synth

  binaural.to(bus)

  function createSynth() {
    synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.brown(),
    }).filtered({
      frequency: engine.const.minFrequency,
    })

    engine.audio.ramp.linear(synth.param.gain, gain, engine.const.zeroTime)
    binaural.from(synth)
  }

  function destroySynth() {
    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, engine.const.zeroTime)
    synth.stop(engine.audio.zeroTime())
    synth = null
  }

  function updateSynth() {
    const {angle} = engine.position.get()
    const value = content.system.wind.value()
    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, value, frequencyDropoff)

    binaural.update({
      x: Math.cos(angle),
      y: Math.sin(angle),
    })

    engine.audio.ramp.set(synth.filter.frequency, frequency)
  }

  return {
    update: function () {
      const z = content.system.z.get()

      if (z < 0) {
        if (synth) {
          destroySynth()
        }
        return this
      }

      if (!synth) {
        createSynth()
      }

      updateSynth()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.surface.wind.update()
})
