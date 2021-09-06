content.audio.underwater.proximity = (() => {
  const acceleration = 20,
    bus = content.audio.mixer.bus.misc.createBus(),
    radius = 10,
    release = 1/16,
    rootFrequency = engine.utility.midiToFrequency(57)

  let binaural,
    next,
    synth

  bus.gain.value = engine.utility.fromDb(-12)

  function calculateParameters(node) {
    next = content.utility.accelerate.vector(next, node, acceleration)

    const relative = next.subtract(
      engine.position.getVector()
    ).rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    const angleRatio = engine.utility.scale(Math.cos(Math.atan2(relative.y, relative.x)), -1, 1, 0, 1),
      distanceRatio = engine.utility.clamp(1 - (relative.distance() / radius), 0, 1)

    const amodDepth = engine.utility.lerp(1/2, 1/2.5, distanceRatio)

    return {
      amodDepth,
      amodFrequency: engine.utility.lerpExp(2, 12, distanceRatio, 2),
      detune: engine.utility.scale(relative.z, -radius, radius, -1200, 1200),
      carrierGain: 1 - amodDepth,
      filterFrequency: rootFrequency * engine.utility.lerpExp(1, 4, angleRatio, 2),
      fmodDepth: engine.utility.addInterval(rootFrequency, -6/12),
      fmodFrequency: rootFrequency,
      gain: distanceRatio ** (1/2),
      relative,
    }
  }

  function createSynth(node) {
    next = node

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      detune,
      filterFrequency,
      fmodDepth,
      fmodFrequency,
      gain,
      relative,
    } = calculateParameters(node)

    synth = engine.audio.synth.createMod({
      amodDepth,
      amodFrequency,
      carrierDetune: detune,
      carrierFrequency: rootFrequency,
      carrierGain,
      carrierType: 'sawtooth',
      gain,
      fmodDepth: fmodDepth,
      fmodFrequency,
      fmodType: 'square',
    }).filtered({
      detune,
      frequency: filterFrequency,
    })

    binaural = engine.audio.binaural.create(relative).from(synth).to(bus)
  }

  function destroySynth() {
    const previousBinaural = binaural,
      previousSynth = synth

    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)

    setTimeout(() => {
      previousBinaural.destroy()
      previousSynth.stop()
    }, release * 1000)

    binaural = null
    synth = null
  }

  function updateSynth(node) {
    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      detune,
      filterFrequency,
      fmodDepth,
      fmodFrequency,
      gain,
      relative,
    } = calculateParameters(node)

    binaural.update(relative)

    engine.audio.ramp.set(synth.filter.detune, detune)
    engine.audio.ramp.set(synth.filter.frequency, filterFrequency)
    engine.audio.ramp.set(synth.param.amod.depth, amodDepth)
    engine.audio.ramp.set(synth.param.amod.frequency, amodFrequency)
    engine.audio.ramp.set(synth.param.detune, detune)
    engine.audio.ramp.set(synth.param.carrierGain, carrierGain)
    engine.audio.ramp.set(synth.param.gain, gain)
    engine.audio.ramp.set(synth.param.fmod.depth, fmodDepth)
    engine.audio.ramp.set(synth.param.fmod.frequency, fmodFrequency)
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      const position = engine.position.getVector()
      const node = content.exploration.find(position, radius)

      if (node) {
        if (synth) {
          updateSynth(node)
        } else {
          createSynth(node)
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.underwater.proximity.update()
})

engine.state.on('reset', () => content.audio.underwater.proximity.reset())
