content.system.audio.surface.wind = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.system.audio.mixer.bus.environment.createBus()

  const frequencyDropoff = 1.5,
    maxFrequency = 80,
    minFrequency = 20

  let synth

  binaural.to(bus)

  // XXX: Compensate for engine.const.distancePower = 1 (was 0 at 2)
  bus.gain.value = engine.utility.fromDb(-6)

  function createSynth() {
    synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.brown(),
    }).filtered({
      frequency: engine.const.minFrequency,
      type: 'bandpass',
    })

    engine.audio.ramp.linear(bus.gain, 1, engine.const.zeroTime)
    binaural.from(synth)
  }

  function destroySynth() {
    engine.audio.ramp.linear(bus.gain, engine.const.zeroGain, engine.const.zeroTime)
    synth.stop(engine.audio.zeroTime())
    synth = null
  }

  function getVector() {
    const movement = engine.position.getVelocity()
      .scale(1 / content.const.surfaceNormalMaxVelocity)
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const wind = engine.utility.vector3d.create({x: -1})
      .scale(content.system.wind.value() ** 4)
      .rotateQuaternion(engine.position.getQuaternion())

    return movement.add(wind)
  }

  function updateSynth() {
    const vector = getVector()
    const strength = vector.distance()

    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, strength, frequencyDropoff),
      gain = engine.utility.fromDb(engine.utility.scale(strength, 0, 4, -6, -10.5))

    engine.audio.ramp.set(synth.filter.frequency, frequency)
    engine.audio.ramp.set(synth.param.gain, gain)

    binaural.update(
      vector.scale(1 / strength)
    )
  }

  return {
    update: function () {
      if (content.system.movement.isUnderwater()) {
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
