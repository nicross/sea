content.system.audio.surface.moon = (() => {
  const bus = content.system.audio.mixer.bus.music.createBus(),
    clockPreRise = 0.725,
    clockPreSet = 0.245,
    clockPostRise = 0.755,
    clockPostSet = 0.275,
    cycleFullyVisible = 0.525,
    fadeDepth = 100,
    rootFrequency = engine.utility.midiToFrequency(54),
    subFrequency = engine.utility.midiToFrequency(30),
    thirdFrequency = engine.utility.midiToFrequency(57)

  const rootAmodDepth = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'moonRootAmodDepth', 4),
    rootAmodFrequency = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'moonRootAmodFrequency', 4),
    thirdAmodDepth = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'moonThirdAmodDepth', 4),
    thirdAmodFrequency = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'moonThirdAmodFrequency', 4)

  let binaural,
    synth

  bus.gain.value = engine.utility.fromDb(-15)

  content.utility.ephemeralNoise.manage(rootAmodDepth)
  content.utility.ephemeralNoise.manage(rootAmodFrequency)
  content.utility.ephemeralNoise.manage(thirdAmodDepth)
  content.utility.ephemeralNoise.manage(thirdAmodFrequency)

  function calculatePitch() {
    // via app.canvas.celestials, consider refactoring
    const clock = content.system.time.clock(),
      value = (2 * Math.PI * -clock) - (Math.PI / 2)

    return engine.utility.wrap(value, 0, Math.PI * 2)
  }

  function calculatePreset() {
    const preset = {
      root: {
        amodDepth: 0,
        amodFrequency: 0,
        carrierGain: 1,
        color: 1,
        fmodDepth: rootFrequency / 2,
        fmodFrequency: rootFrequency / 2,
        gain: 1/4,
      },
      sub: {
        gain: 1/2,
        modFrequency: 1,
      },
      third: {
        amodDepth: 0,
        amodFrequency: 0,
        carrierGain: 1,
        color: 1,
        fmodDepth: rootFrequency / 2,
        fmodFrequency: thirdFrequency * 8,
        gain: 1/4,
      },
    }

    // Amplitude modulation
    const time = content.system.time.value()

    preset.root.amodDepth = engine.utility.lerp(1/16, 1/2, rootAmodDepth.value(time / 60))
    preset.root.amodFrequency = engine.utility.lerpExp(1/16, 4, rootAmodFrequency.value(time / 60), 6)
    preset.third.amodDepth = engine.utility.lerp(1/16, 1/2, thirdAmodDepth.value(time / 60))
    preset.third.amodFrequency = engine.utility.lerpExp(1/16, 4, thirdAmodFrequency.value(time / 60), 6)

    preset.root.carrierGain = 1 - preset.root.amodDepth
    preset.third.carrierGain = 1 - preset.third.amodDepth

    // Apply color over cycle
    const cycle = 1 - content.system.time.cycle()

    const color = cycle >= cycleFullyVisible
      ? engine.utility.lerpExp(1, 8, engine.utility.scale(cycle, cycleFullyVisible, 1, 1, 0), 2)
      : 8

    preset.root.color = color
    preset.third.color = color

    // Adjust sub mod rate over cycle
    preset.sub.modFrequency = engine.utility.lerpExp(6, 4, cycle, 2)

    // Apply fade out below surface
    const surface = content.system.surface.currentHeight()
    const {z} = engine.position.getVector()

    if (z < surface) {
      const depthFactor = engine.utility.scale(z, surface, surface - fadeDepth, 1, 0)

      preset.root.color *= depthFactor
      preset.sub.gain *= depthFactor
      preset.third.color *= depthFactor
    }

    // Apply fade out below horizon
    const clock = content.system.time.clock()

    if (engine.utility.between(clock, clockPreSet, clockPostRise)) {
      let timeFactor = clock <= clockPostSet
        ? engine.utility.scale(clock, clockPreSet, clockPostSet, 1, 0)
        : engine.utility.scale(clock, clockPostRise, clockPreRise, 1, 0)

      timeFactor = engine.utility.clamp(timeFactor, 0, 1)

      preset.root.color *= timeFactor
      preset.root.gain *= timeFactor ** 4
      preset.sub.gain *= timeFactor ** 2
      preset.third.gain *= timeFactor ** 3
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
      carrierFrequency: rootFrequency,
      carrierGain: preset.root.carrierGain,
      carrierType: 'sine',
      fmodDepth: preset.root.fmodDepth,
      fmodFrequency: preset.root.fmodFrequency,
      gain: preset.root.gain,
    }).filtered({
      frequency: rootFrequency * preset.root.color,
    })

    const third = engine.audio.synth.createMod({
      amodDepth: preset.third.amodDepth,
      amodFrequency: preset.third.amodFrequency,
      carrierFrequency: thirdFrequency,
      carrierGain: preset.third.carrierGain,
      carrierType: 'sine',
      fmodDepth: preset.third.fmodDepth,
      fmodFrequency: preset.third.fmodFrequency,
      gain: preset.third.gain,
    }).filtered({
      frequency: thirdFrequency * preset.third.color,
    })

    const sub = engine.audio.synth.createAm({
      carrierFrequency: subFrequency,
      carrierGain: 5/8,
      gain: preset.sub.gain,
      modDepth: 3/8,
      modFrequency: preset.sub.modFrequency,
    })

    binaural.from(root).from(third).from(sub)

    synth = {
      root,
      stop: function (...args) {
        root.stop(...args)
        third.stop(...args)
        sub.stop(...args)
        return this
      },
      sub,
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
    engine.audio.ramp.set(synth.root.param.carrierGain, preset.root.carrierGain)
    engine.audio.ramp.set(synth.root.param.fmod.depth, preset.root.fmodDepth)
    engine.audio.ramp.set(synth.root.param.fmod.frequency, preset.root.fmodFrequency)
    engine.audio.ramp.set(synth.root.filter.frequency, rootFrequency * preset.root.color)
    engine.audio.ramp.set(synth.root.param.gain, preset.root.gain)

    engine.audio.ramp.set(synth.third.param.amod.depth, preset.third.amodDepth)
    engine.audio.ramp.set(synth.third.param.amod.frequency, preset.third.amodFrequency)
    engine.audio.ramp.set(synth.third.param.carrierGain, preset.third.carrierGain)
    engine.audio.ramp.set(synth.third.param.fmod.depth, preset.third.fmodDepth)
    engine.audio.ramp.set(synth.third.param.fmod.frequency, preset.third.fmodFrequency)
    engine.audio.ramp.set(synth.third.filter.frequency, thirdFrequency * preset.third.color)
    engine.audio.ramp.set(synth.third.param.gain, preset.third.gain)

    engine.audio.ramp.set(synth.sub.param.gain, preset.sub.gain)
    engine.audio.ramp.set(synth.sub.param.mod.frequency, preset.sub.modFrequency)
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

      if (engine.utility.between(clock, clockPostSet, clockPreRise)) {
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

  content.system.audio.surface.moon.update()
})

engine.state.on('reset', () => content.system.audio.surface.moon.reset())
