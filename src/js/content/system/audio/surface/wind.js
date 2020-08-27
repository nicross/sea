content.system.audio.surface.wind = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = engine.audio.mixer.createBus()

  const frequencyDropoff = 1,
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
    const movement = engine.movement.get(),
      position = engine.position.get(),
      windValue = content.system.wind.value(),
      zVelocity = content.system.movement.zVelocity()

    const velocityRatio = movement.velocity / content.const.surfaceNormalMaxVelocity

    const sum = [
      {
        x: Math.cos(position.angle) * windValue,
        y: Math.sin(position.angle) * windValue,
      },
      [
        {
          x: Math.cos(movement.angle) * velocityRatio,
          y: Math.sin(movement.angle) * velocityRatio,
        },
        {
          x: Math.abs(zVelocity) / content.const.surfaceNormalMaxVelocity,
          y: 0,
        },
      ].reduce((max, point) => ({
        x: Math.max(max.x, point.x),
        y: Math.max(max.y, point.y),
      }), {x: 0, y: 0}),
    ].reduce((sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }), {x: 0, y: 0})

    const angle = Math.atan2(sum.y, sum.x)

    return {
      angle,
      radius: engine.utility.distanceOrigin(sum.x, sum.y),
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
  }

  function updateSynth() {
    const {angle, x, y, radius} = getVector()

    binaural.update({
      x,
      y,
    })

    //console.log(engine.utility.radiansToDegrees(angle))

    const frequency = engine.utility.lerpExp(minFrequency, maxFrequency, radius, frequencyDropoff),
      gain = engine.utility.fromDb(engine.utility.scale(radius, 0, content.const.surfaceTurboMaxVelocity, -6, -9))

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
