content.system.audio.surface.sun = (() => {
  const bus = content.system.audio.createBus(),
    clockPreRise = 0.225,
    clockPreSet = 0.7375,
    clockPostRise = 0.2625,
    clockPostSet = 0.775,
    fadeDepth = 100,
    rootFrequency = engine.utility.midiToFrequency(57),
    thirdFrequency = engine.utility.midiToFrequency(61)

  const rootAmodDepth = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'sunRootAmodDepth', 4),
    rootAmodFrequency = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'sunRootAmodFrequency', 4),
    thirdAmodDepth = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'sunThirdAmodDepth', 4),
    thirdAmodFrequency = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'sunThirdAmodFrequency', 4)

  let binaural,
    synth

  bus.gain.value = engine.utility.fromDb(-18)

  content.utility.ephemeralNoise.manage(rootAmodDepth)
  content.utility.ephemeralNoise.manage(rootAmodFrequency)
  content.utility.ephemeralNoise.manage(thirdAmodDepth)
  content.utility.ephemeralNoise.manage(thirdAmodFrequency)

  function calculatePitch() {
    // via app.screen.game.canvas.celestials, consider refactoring
    const clock = content.system.time.clock(),
      value = (2 * Math.PI * -clock) + (Math.PI / 2)

    return engine.utility.wrap(value, 0, Math.PI * 2)
  }

  function calculatePreset() {
    const preset = {
      root: {
        amodDepth: 0,
        amodFrequency: 0,
        carrierDetune: 0,
        carrierGain: 0.5,
        color: 1,
        fmodDepth: rootFrequency,
        fmodFrequency: rootFrequency / 2,
        gain: 0.5,
      },
      third: {
        amodDepth: 0,
        amodFrequency: 0,
        carrierDetune: 0,
        carrierGain: 0.5,
        color: 1,
        fmodDepth: 0,
        fmodFrequency: 0,
        gain: 0.5,
      },
    }

    // Amplitude modulation
    const time = content.system.time.value()

    preset.root.amodDepth = engine.utility.lerp(0.125, 0.25, rootAmodDepth.value(time / 60))
    preset.root.amodFrequency = engine.utility.lerpExp(1/16, 4, rootAmodFrequency.value(time / 60), 4)
    preset.third.amodDepth = engine.utility.lerp(0.125, 0.25, thirdAmodDepth.value(time / 60))
    preset.third.amodFrequency = engine.utility.lerpExp(1/16, 4, thirdAmodFrequency.value(time / 60), 4)

    preset.root.carrierGain = 1 - preset.root.amodDepth
    preset.third.carrierGain = 1 - preset.third.amodDepth

    // Apply color over cycle
    const cycle = content.system.time.cycle()

    const color = cycle >= 0.5
      ? engine.utility.lerpLog(1, 8, engine.utility.scale(cycle, 0.5, 1, 1, 0), 0.5)
      : 8

    preset.root.color = color
    preset.third.color = color

    // Apply fade out below surface
    const surface = content.system.surface.currentHeight()
    const {z} = engine.position.getVector()

    if (z < surface) {
      preset.root.color *= engine.utility.scale(z, surface, surface - fadeDepth, 1, 0)
      preset.third.color *= engine.utility.scale(z, surface, surface - fadeDepth, 1, 0)
    }

    // Apply fade out below horizon
    const clock = content.system.time.clock()

    if (!engine.utility.between(clock, clockPostRise, clockPreSet)) {
      let timeFactor = clock <= clockPostRise
        ? engine.utility.scale(clock, clockPostRise, clockPreRise, 1, 0)
        : engine.utility.scale(clock, clockPreSet, clockPostSet, 1, 0)

      timeFactor = engine.utility.clamp(timeFactor, 0, 1) ** 4

      preset.root.color *= timeFactor
      preset.root.gain *= timeFactor

      preset.third.color *= timeFactor
      preset.third.gain *= timeFactor
    }

    return preset
  }

  function createBinaural(relative) {
    binaural = engine.audio.binaural.create(relative).to(bus)
  }

  function createSynth(preset) {
    const root = engine.audio.synth.createMod({
      amodDepth: preset.root.amodDepth,
      amodFrequency: preset.root.amodFrequency,
      carrierDetune: preset.root.carrierDetune,
      carrierFrequency: rootFrequency,
      carrierGain: preset.root.carrierGain,
      carrierType: 'triangle',
      fmodDepth: preset.root.fmodDepth,
      fmodFrequency: preset.root.fmodFrequency,
      gain: preset.root.gain,
    }).shaped(
      syngen.audio.shape.distort()
    ).filtered({
      frequency: rootFrequency * preset.root.color,
    })

    const third = engine.audio.synth.createMod({
      amodDepth: preset.third.amodDepth,
      amodFrequency: preset.third.amodFrequency,
      carrierDetune: preset.third.carrierDetune,
      carrierFrequency: thirdFrequency,
      carrierGain: preset.third.carrierGain,
      carrierType: 'triangle',
      fmodDepth: preset.third.fmodDepth,
      fmodFrequency: preset.third.fmodFrequency,
      gain: preset.third.gain,
    }).shaped(
      syngen.audio.shape.distort()
    ).filtered({
      frequency: thirdFrequency * preset.third.color,
    })

    binaural.from(root).from(third)

    synth = {
      root,
      stop: function (...args) {
        root.stop(...args)
        third.stop(...args)
        return this
      },
      third,
    }
  }

  function teardown() {
    if (binaural) {
      binaural.destroy()
      binaural = undefined
    }

    if (synth) {
      synth.stop()
      synth = undefined
    }
  }

  function updateBinaural() {
    const relative = engine.utility.vector3d.create({
      x: 1,
      y: 0,
      z: 0,
    }).rotateEuler({
      pitch: calculatePitch(),
    }).rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    if (binaural) {
      binaural.update(relative)
    } else {
      createBinaural(relative)
    }
  }

  function updateSynth() {
    const preset = calculatePreset()

    if (!synth) {
      createSynth(preset)
      return
    }

    engine.audio.ramp.set(synth.root.param.amod.depth, preset.root.amodDepth)
    engine.audio.ramp.set(synth.root.param.amod.frequency, preset.root.amodFrequency)
    engine.audio.ramp.set(synth.root.param.detune, preset.root.carrierDetune)
    engine.audio.ramp.set(synth.root.param.carrierGain, preset.root.carrierGain)
    engine.audio.ramp.set(synth.root.param.fmod.depth, preset.root.fmodDepth)
    engine.audio.ramp.set(synth.root.param.fmod.frequency, preset.root.fmodFrequency)
    engine.audio.ramp.set(synth.root.filter.frequency, rootFrequency * preset.root.color)
    engine.audio.ramp.set(synth.root.param.gain, preset.root.gain)

    engine.audio.ramp.set(synth.third.param.amod.depth, preset.third.amodDepth)
    engine.audio.ramp.set(synth.third.param.amod.frequency, preset.third.amodFrequency)
    engine.audio.ramp.set(synth.third.param.detune, preset.third.carrierDetune)
    engine.audio.ramp.set(synth.third.param.carrierGain, preset.third.carrierGain)
    engine.audio.ramp.set(synth.third.param.fmod.depth, preset.third.fmodDepth)
    engine.audio.ramp.set(synth.third.param.fmod.frequency, preset.third.fmodFrequency)
    engine.audio.ramp.set(synth.third.filter.frequency, rootFrequency * preset.third.color)
    engine.audio.ramp.set(synth.third.param.gain, preset.third.gain)
  }

  return {
    reset: function () {
      teardown()
      return this
    },
    update: function () {
      const surface = content.system.surface.currentHeight()
      const {z} = engine.position.getVector()

      if (z <= surface - fadeDepth) {
        teardown()
        return this
      }

      const clock = content.system.time.clock()

      if (!engine.utility.between(clock, clockPreRise, clockPostSet)) {
        teardown()
        return this
      }

      updateBinaural()
      updateSynth()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.surface.sun.update()
})

engine.state.on('reset', () => content.system.audio.surface.sun.reset())
