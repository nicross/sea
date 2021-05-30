content.audio.engine = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.audio.mixer.bus.misc.createBus(),
    rootFrequency = engine.utility.midiToFrequency(33)

  let detune = 0,
    strength = engine.utility.vector3d.create(),
    synth

  bus.gain.value = engine.utility.fromDb(-6.66)
  binaural.to(bus)

  function calculateIntent() {
    const rotate = engine.utility.vector3d.create({
      y: -content.movement.getAngularThrust(),
    }).scale(1/12)

    const thrust = content.movement.getLateralThrust().inverse()

    return thrust.add(rotate)
      .scale(content.movement.isTurbo() ? 1 : 0.5)
  }

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
    detune = engine.utility.random.float(-12.5, 12.5)

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
  }

  function destroySynth() {
    const now = engine.audio.time(),
      release = 1/32

    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(now + release)
    synth = null
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

    binaural.update(strength.normalize())
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      strength = engine.utility.vector3d.create()

      return this
    },
    update: function () {
      const intent = calculateIntent()

      strength = content.utility.accelerate.vector(strength, intent, 3)

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
