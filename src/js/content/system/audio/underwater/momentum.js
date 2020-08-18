content.system.audio.underwater.momentum = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = engine.audio.mixer.createBus()

  const frequencyDropoff = 1/2,
    gainDropoff = 1,
    maxFrequency = 200,
    minFrequency = 80

  let synth

  bus.gain.value = engine.utility.fromDb(-6)
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
    const isTurbo = content.system.movement.isTurbo(),
      movement = engine.movement.get(),
      zVelocity = content.system.movement.zVelocity()

    const vectors = []

    if (movement.velocity) {
      vectors.push({
        x: Math.cos(movement.angle) * movement.velocity / content.const.underwaterTurboMaxVelocity,
        y: Math.sin(movement.angle) * movement.velocity / content.const.underwaterTurboMaxVelocity,
      })
    }

    if (zVelocity) {
      vectors.push({
        x: Math.abs(zVelocity) / content.const.underwaterTurboMaxVelocity,
        y: 0,
      })
    }

    const sum = vectors.reduce((sum, vector) => ({
      x: sum.x + vector.x,
      y: sum.y + vector.y,
    }), {x: 0, y: 0})

    const angle = Math.atan2(sum.y, sum.x)

    binaural.update({
      x: Math.cos(angle),
      y: Math.sin(angle),
    })

    const strength = engine.utility.clamp(engine.utility.distanceOrigin(sum.x, sum.y), 0, 1)

    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, strength, frequencyDropoff)

    const gain = isTurbo
      ? strength ** gainDropoff
      : Math.min(1, (strength * (content.const.underwaterTurboMaxVelocity / content.const.underwaterNormalMaxVelocity))) ** gainDropoff

    engine.audio.ramp.set(synth.filter.frequency, frequency)
    engine.audio.ramp.set(synth.param.gain, gain)
  }

  return {
    update: function () {
      const {velocity} = engine.movement.get()

      const z = content.system.z.get(),
        zVelocity = content.system.movement.zVelocity()

      const shouldUpdate = z < 0 && (velocity || zVelocity)

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