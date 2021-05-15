content.audio.engine = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.audio.mixer.bus.misc.createBus()

  const fadeDuration = 1/6,
    rootFrequency = engine.utility.midiToFrequency(33),
    rotationStrength = 1/25,
    turboDetune = 1200

  let synth

  bus.gain.value = engine.utility.fromDb(-7.5)
  binaural.to(bus)

  function calculateParams() {
    const vector = getLateralThrusters().add(
      getAngularThrusters()
    )

    const strength = vector.distance()

    return {
      strength: Math.min(strength, 1),
      vector: vector.scale(strength ? (1 / strength) : 0),
    }
  }

  function calculateWork(thrust, velocity) {
    if (thrust == velocity) {
      return thrust
    }

    const thrustSign = engine.utility.sign(thrust),
      velocitySign = engine.utility.sign(velocity)

    if (thrustSign == velocitySign) {
      if (Math.abs(velocity) > Math.abs(thrust)) {
        return thrust
      }

      if (velocity > 0) {
        return Math.max(velocity, engine.const.zero)
      }

      if (velocity < 0) {
        return Math.min(velocity, -engine.const.zero)
      }

      return 0
    }

    return thrust ? thrustSign * engine.const.zero : 0
  }

  function createSynth() {
    const detune = engine.utility.random.float(-12.5, 12.5),
      isTurbo = content.movement.isTurbo()

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

  function getAngularThrusters() {
    const thrust = content.movement.getAngularThrust()

    if (!thrust) {
      return engine.utility.vector3d.create()
    }

    const ratio = Math.abs(engine.position.getAngularVelocityEuler().yaw) / content.movement.getAngularMaxVelocity(),
      strength = engine.utility.clamp(thrust * ratio, -1, 1) * rotationStrength

    return engine.utility.vector3d.create({
      x: Math.abs(strength),
      y: -strength,
    })
  }

  function getLateralThrusters() {
    const lateralThrust = content.movement.getLateralThrust()

    const velocity = engine.position.getVelocity()
      .scale(1 / content.movement.getLateralMaxVelocity())
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    let result = engine.utility.vector3d.create({
      x: calculateWork(lateralThrust.x, velocity.x),
      y: calculateWork(lateralThrust.y, velocity.y),
      z: calculateWork(lateralThrust.z, velocity.z),
    })

    const radius = result.distance()

    if (radius > 1) {
      result = result.scale(1 / radius)
    }

    return result.rotateEuler({yaw: Math.PI})
  }

  function updateSynth() {
    const {
      strength,
      vector,
    } = calculateParams()

    const isCatchingAir = content.movement.isCatchingAir(),
      isTurbo = content.movement.isTurbo(),
      isUnderwater = content.movement.isUnderwater()

    const amodFrequency = isCatchingAir
      ? 27.5
      : engine.utility.lerp(4, 16, strength)

    const color = isUnderwater
      ? (isTurbo ? 1 : 2)
      : (isCatchingAir ? 4 : 2)

    const gain = engine.utility.lerpExp(0.5, 1, strength, 0.5)

    engine.audio.ramp.set(synth.filter.frequency, rootFrequency * color)
    engine.audio.ramp.set(synth.param.amod.frequency, amodFrequency)
    engine.audio.ramp.set(synth.param.gain, gain)

    binaural.update(vector)
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
    update: function () {
      const angularThrust = content.movement.getAngularThrust(),
        lateralThrust = content.movement.getLateralThrust()

      const shouldHaveSynth = content.movement.isSurface()
        ? angularThrust || lateralThrust.x
        : angularThrust || lateralThrust.x || lateralThrust.y || lateralThrust.z

      if (shouldHaveSynth) {
        if (!synth) {
          createSynth()
        }
        updateSynth()
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.movement.on('transition-normal', () => content.audio.engine.onNormal())
  content.movement.on('transition-turbo', () => content.audio.engine.onTurbo())
})

engine.loop.on('frame', () => content.audio.engine.update())
engine.state.on('reset', () => content.audio.engine.reset())
