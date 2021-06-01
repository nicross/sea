content.audio.engine = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.audio.mixer.bus.misc.createBus(),
    rootFrequency = engine.utility.midiToFrequency(33)

  let detune = 0,
    position = engine.utility.vector3d.create(),
    strength = engine.utility.vector3d.create(),
    synth

  bus.gain.value = engine.utility.fromDb(-6.66)
  binaural.to(bus)

  function calculateParameters() {
    const magnitude = strength.distance()

    const isCatchingAir = content.movement.isCatchingAir(),
      isTurbo = content.movement.isTurbo(),
      isUnderwater = content.movement.isUnderwater()

    const color = isUnderwater
      ? 1
      : (isCatchingAir ? 4 : 2)

    const amodDepth = engine.utility.lerpExp(1/12, 1/2, magnitude, 0.5),
      turboThreshold = isTurbo ? 0.25 : 0.5

    const fullDetune = magnitude >= turboThreshold
      ? engine.utility.scale(magnitude, turboThreshold, 1, 0, 1200)
      : engine.utility.scale(magnitude, 0, turboThreshold, -500, 0)

    return {
      amodDepth,
      amodFrequency: isCatchingAir ? 27.5 : engine.utility.lerpExp(4, 16, magnitude, 2),
      detune: detune + fullDetune,
      carrierGain: 1 - amodDepth,
      filterFrequency: rootFrequency * color,
      gain: engine.utility.lerpExp(engine.const.zeroGain, 1, magnitude, 1/3),
    }
  }

  function createSynth() {
    detune = engine.utility.random.float(-5, 5)

    const parameters = calculateParameters()

    synth = engine.audio.synth.createMod({
      amodDepth: parameters.amodDepth,
      amodFrequency: parameters.amodFrequency,
      amodType: 'triangle',
      carrierDetune: parameters.detune,
      carrierFrequency: rootFrequency,
      carrierGain: parameters.carrierGain,
      carrierType: 'sawtooth',
      fmodDepth: rootFrequency / 2,
      fmodDetune: parameters.detune,
      fmodFrequency: rootFrequency,
      fmodType: 'sawtooth',
      gain: parameters.gain,
    }).filtered({
      detune: parameters.detune,
      frequency: parameters.filterFrequency,
    })

    binaural.from(synth.output)
    binaural.update(position.normalize())
  }

  function destroySynth() {
    const now = engine.audio.time(),
      release = 1/32

    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(now + release)
    synth = null
  }

  function updateStrength() {
    const angularThrust = content.movement.getAngularThrust(),
      lateralThrust = content.movement.getLateralThrust(),
      isTurbo = content.movement.isTurbo()

    let intendedPosition = lateralThrust.inverse(),
      intendedStrength = lateralThrust.scale(isTurbo ? 1 : 0.5)

    if (angularThrust) {
      intendedPosition = intendedPosition.isZero()
        ? intendedPosition.add({
            x: Math.cos(-angularThrust * Math.PI/4),
            y: Math.sin(-angularThrust * Math.PI/4),
          })
        : intendedPosition.rotateEuler({yaw: angularThrust * Math.PI/4})

      intendedStrength = intendedStrength.isZero()
        ? intendedStrength.add({
            x: Math.abs(angularThrust / 12),
          })
        : intendedStrength.scale(1 + Math.abs(angularThrust / 12))
    }

    position = content.utility.accelerate.vector(position, intendedPosition, 2)
    strength = content.utility.accelerate.vector(strength, intendedStrength, 2)
  }

  function updateSynth() {
    const parameters = calculateParameters()

    engine.audio.ramp.set(synth.filter.detune, parameters.detune)
    engine.audio.ramp.set(synth.filter.frequency, parameters.filterFrequency)
    engine.audio.ramp.set(synth.param.amod.depth, parameters.amodDepth)
    engine.audio.ramp.set(synth.param.amod.frequency, parameters.amodFrequency)
    engine.audio.ramp.set(synth.param.carrierGain, parameters.carrierGain)
    engine.audio.ramp.set(synth.param.fmod.detune, parameters.detune)
    engine.audio.ramp.set(synth.param.detune, parameters.detune)
    engine.audio.ramp.set(synth.param.gain, parameters.gain)

    binaural.update(position.normalize())
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      position = engine.utility.vector3d.create()
      strength = engine.utility.vector3d.create()

      return this
    },
    update: function () {
      updateStrength()

      if (!strength.isZero()) {
        if (synth) {
          updateSynth()
        } else {
          createSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', () => content.audio.engine.update())
engine.state.on('reset', () => content.audio.engine.reset())
