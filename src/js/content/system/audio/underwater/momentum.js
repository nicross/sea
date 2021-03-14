content.system.audio.underwater.momentum = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.system.audio.mixer.bus.environment.createBus()

  const frequencyDropoff = 1/4,
    gainDropoff = 1/4,
    maxFrequency = 200,
    minFrequency = 80

  let synth

  // XXX: Compensate for engine.const.distancePower = 1 (was -6 at 2)
  bus.gain.value = engine.utility.fromDb(-9)
  binaural.to(bus)

  function createSynth() {
    synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.brown(),
    }).filtered({
      frequency: engine.const.minFrequency,
    })

    binaural.from(synth)
  }

  function destroySynth() {
    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, engine.const.zeroTime)
    synth.stop(engine.audio.zeroTime())
    synth = null
  }

  function updateSynth() {
    const sum = engine.position.getVelocity().scale(1 / content.const.underwaterTurboMaxVelocity)
    const strength = engine.utility.clamp(sum.distance(), 0, 1)

    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, strength, frequencyDropoff),
      gain = strength ** gainDropoff

    engine.audio.ramp.set(synth.filter.frequency, frequency)
    engine.audio.ramp.set(synth.param.gain, gain)

    binaural.update(
      sum.normalize()
        .rotateQuaternion(engine.position.getQuaternion().conjugate())
    )
  }

  return {
    update: function () {
      const shouldUpdate = engine.position.getVector().z < 0 && !engine.position.getVelocity().isZero()

      if (!shouldUpdate) {
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

  content.system.audio.underwater.momentum.update()
})
