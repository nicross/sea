content.system.audio.engine = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.system.audio.createBus()

  const fadeDuration = 1/6,
    rootFrequency = engine.utility.midiToFrequency(33),
    rotationStrength = 1/100,
    turboDetune = 1200

  let fakeTurn = 0,
    synth

  // XXX: Compensate for engine.const.distancePower = 1 (was -4.5 at 2)
  bus.gain.value = engine.utility.fromDb(-6)
  binaural.to(bus)

  function calculateParams(controls) {
    const points = content.system.movement.isUnderwater()
      ? calculateUnderwaterPoints(controls)
      : calculateSurfacePoints(controls)

    const sum = points.reduce((sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }), {x: 0, y: 0})

    const angle = Math.atan2(sum.y, sum.x),
      x = Math.cos(angle),
      y = Math.sin(angle)

    const radius = engine.utility.clamp(engine.utility.distanceOrigin(sum.x, sum.y), 0, 1)

    return {
      angle,
      radius,
      x,
      y,
    }
  }

  function calculateSurfacePoints(controls) {
    const isCatchingAir = content.system.movement.isCatchingAir(),
      movement = engine.movement.get(),
      points = []

    if ((controls.rotate || fakeTurn) && !isCatchingAir) {
      const rotate = ((controls.rotate * Math.abs(movement.rotation) / engine.const.movementMaxRotation) || fakeTurn) * rotationStrength

      points.push({
        x: Math.abs(rotate),
        y: -rotate,
      })
    }

    if (controls.y) {
      if (isCatchingAir) {
        points.push({
          x: controls.y * engine.const.movementMaxVelocity / content.const.surfaceTurboMaxVelocity,
          y: 0,
        })
      } else {
        points.push({
          x: controls.y * movement.velocity / content.const.surfaceTurboMaxVelocity,
          y: 0,
        })
      }
    }

    return points
  }

  function calculateUnderwaterPoints(controls) {
    const movement = engine.movement.get(),
      points = []

    if (controls.rotate || fakeTurn) {
      const rotate = ((controls.rotate * Math.abs(movement.rotation) / engine.const.movementMaxRotation) || fakeTurn) * rotationStrength

      points.push({
        x: Math.abs(rotate),
        y: -rotate,
      })
    }

    if (controls.y) {
      points.push({
        x: controls.y * movement.velocity / content.const.underwaterTurboMaxVelocity,
        y: 0,
      })
    }

    if (controls.x) {
      points.push({
        x: 0,
        y: controls.x * movement.velocity / content.const.underwaterTurboMaxVelocity,
      })
    }

    if (controls.z) {
      points.push({
        x: Math.abs(controls.z * content.system.movement.zVelocity()) / content.const.underwaterTurboMaxVelocity,
        y: 0,
      })
    }

    return points
  }

  function createSynth() {
    const detune = engine.utility.random.float(-12.5, 12.5),
      isTurbo = content.system.movement.isTurbo()

    synth = engine.audio.synth.createMod({
      amodDepth: 0,
      amodFrequency: 0,
      amodType: 'triangle',
      carrierDetune: detune + (isTurbo ? turboDetune : 0),
      carrierFrequency: rootFrequency,
      carrierGain: 0,
      carrierType: 'sawtooth',
      fmodDepth: rootFrequency / 2,
      fmodDetune: detune + (isTurbo ? turboDetune : 0),
      fmodFrequency: rootFrequency,
      fmodType: 'sawtooth',
      gain: engine.const.zeroGain,
    }).filtered({
      detune: detune + (isTurbo ? turboDetune : 0),
      frequency: rootFrequency,
    })

    engine.audio.ramp.linear(synth.param.carrierGain, 1/2, fadeDuration)
    engine.audio.ramp.linear(synth.param.amod.depth, 1/2, fadeDuration)

    binaural.from(synth.output)
  }

  function destroySynth() {
    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, fadeDuration)
    synth.stop(engine.audio.time(fadeDuration))
    synth = null
  }

  function shouldHaveSynth(controls) {
    return content.system.movement.isSurface()
      ? controls.rotate || controls.y || fakeTurn
      : controls.rotate || controls.x || controls.y || controls.z || fakeTurn
  }

  function updateSynth(controls) {
    const {
      radius,
      x,
      y,
    } = calculateParams(controls)

    const isCatchingAir = content.system.movement.isCatchingAir(),
      isSurface = content.system.movement.isSurface(),
      isTurbo = content.system.movement.isTurbo()

    const amodFrequency = isCatchingAir
      ? 27.5
      : engine.utility.lerp(4, 16, radius)

    const color = isSurface
      ? (isCatchingAir ? 4 : 3)
      : (isTurbo ? 1 : 2)

    binaural.update({
      x,
      y,
    })

    engine.audio.ramp.set(synth.filter.frequency, rootFrequency * color)
    engine.audio.ramp.set(synth.param.amod.frequency, amodFrequency)
    engine.audio.ramp.set(synth.param.gain, radius ** 0.25)
  }

  return {
    onNormal: function () {
      if (synth) {
        engine.audio.ramp.linear(synth.filter.detune, 0, 0.5)
        engine.audio.ramp.linear(synth.param.detune, 0, 0.5)
        engine.audio.ramp.linear(synth.param.fmod.detune, 0, 0.5)
      }
    },
    onTurbo: function () {
      if (synth) {
        engine.audio.ramp.linear(synth.filter.detune, turboDetune, 0.5)
        engine.audio.ramp.linear(synth.param.detune, turboDetune, 0.5)
        engine.audio.ramp.linear(synth.param.fmod.detune, turboDetune, 0.5)
      }
    },
    reset: function () {
      if (synth) {
        destroySynth()
      }
      return this
    },
    setFakeTurn: function (value) {
      fakeTurn = engine.utility.sign(value)
      return this
    },
    update: function (controls = {}) {
      if (shouldHaveSynth(controls)) {
        if (!synth) {
          createSynth()
        }
        updateSynth(controls)
      } else if (synth) {
        destroySynth()
      }

      fakeTurn = 0

      return this
    },
  }
})()

engine.ready(() => {
  content.system.movement.on('transition-normal', () => content.system.audio.engine.onNormal())
  content.system.movement.on('transition-turbo', () => content.system.audio.engine.onTurbo())
})

engine.state.on('reset', () => content.system.audio.engine.reset())
