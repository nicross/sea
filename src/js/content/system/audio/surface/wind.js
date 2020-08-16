content.system.audio.surface.wind = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = engine.audio.mixer.createBus()

  const frequencyDropoff = 1,
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

    engine.audio.ramp.linear(bus.gain, 1, engine.const.zeroTime)
    binaural.from(synth)
  }

  function destroySynth() {
    engine.audio.ramp.linear(bus.gain, engine.const.zeroGain, engine.const.zeroTime)
    synth.stop(engine.audio.zeroTime())
    synth = null
  }

  function updateSynth() {
    const {angle} = engine.position.get()
    const value = content.system.wind.value()
    const {velocity} = engine.movement.get()

    let x = Math.cos(angle) * value,
      y = Math.sin(angle) * value

    x += velocity

    const theta = Math.atan2(y, x)

    binaural.update({
      x: Math.cos(theta),
      y: Math.sin(theta),
    })

    const strength = engine.utility.distanceOrigin(x, y)

    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, strength, frequencyDropoff),
      gain = engine.utility.fromDb(engine.utility.scale(strength, 0, content.const.surfaceBoostMaxVelocity, -6, -9))

    engine.audio.ramp.set(synth.filter.frequency, frequency)
    engine.audio.ramp.set(synth.param.gain, gain)
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
