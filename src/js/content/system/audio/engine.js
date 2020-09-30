content.system.audio.engine = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.system.audio.createBus()

  const fadeDuration = 1/6,
    rootFrequency = engine.utility.midiToFrequency(33),
    rotationStrength = 1/25,
    turboDetune = 1200

  let synth

  // XXX: Compensate for engine.const.distancePower = 1 (was -4.5 at 2)
  bus.gain.value = engine.utility.fromDb(-6)
  binaural.to(bus)

  function calculateParams() {
    const vector = getLateralThrusters().add(
      getAngularThrusters()
    )

    let radius = vector.distance()

    if (radius > 1) {
      vector = vector.scale(1 / radius)
      radius = 1
    }

    return {
      radius,
      ...vector,
    }
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

  function getAngularThrusters() {
    const thrust = content.system.movement.getAngularThrust()

    if (!thrust) {
      return engine.utility.vector3d.create()
    }

    const ratio = Math.abs(engine.position.getAngularVelocityEuler().yaw) / content.system.movement.getAngularMaxVelocity(),
      strength = engine.utility.clamp(thrust * ratio, -1, 1) * rotationStrength

    return engine.utility.vector3d.create({
      x: Math.abs(strength),
      y: -strength,
    })
  }

  function getLateralThrusters() {
    // TODO: Model the work the thrusters are doing, e.g. consider the diference between thrust and velocity
    return content.system.movement.getLateralThrust()
      .rotateEuler({yaw: Math.PI})
  }

  function updateSynth() {
    const {
      radius,
      x,
      y,
      z,
    } = calculateParams()

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
      z,
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
    update: function () {
      const angularThrust = content.system.movement.getAngularThrust(),
        lateralThrust = content.system.movement.getLateralThrust()

      const shouldHaveSynth = content.system.movement.isSurface()
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
  content.system.movement.on('transition-normal', () => content.system.audio.engine.onNormal())
  content.system.movement.on('transition-turbo', () => content.system.audio.engine.onTurbo())
})

engine.loop.on('frame', () => content.system.audio.engine.update())
engine.state.on('reset', () => content.system.audio.engine.reset())
