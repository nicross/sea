content.audio.surface.sun = (() => {
  const bus = content.audio.mixer.bus.music.createBus(),
    clockPreRise = 0.225,
    clockPreSet = 0.745,
    clockPostRise = 0.255,
    clockPostSet = 0.775,
    context = engine.audio.context(),
    cycleFullyVisible = 0.525,
    fadeDepth = 100,
    rootFrequency = engine.utility.midiToFrequency(57),
    subFrequency = engine.utility.midiToFrequency(33),
    thirdFrequency = engine.utility.midiToFrequency(61)

  const rootAmodDepth = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'sunRootAmodDepth',
    type: engine.utility.perlin1d,
  })

  const rootAmodFrequency = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'sunRootAmodFrequency',
    type: engine.utility.perlin1d,
  })

  const thirdAmodDepth = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'sunThirdAmodDepth',
    type: engine.utility.perlin1d,
  })

  const thirdAmodFrequency = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'sunThirdAmodFrequency',
    type: engine.utility.perlin1d,
  })

  let binaural,
    synth

  bus.gain.value = engine.utility.fromDb(-15)

  content.utility.ephemeralNoise
    .manage(rootAmodDepth)
    .manage(rootAmodFrequency)
    .manage(thirdAmodDepth)
    .manage(thirdAmodFrequency)

  function calculatePitch() {
    // via app.canvas.celestials, consider refactoring
    const clock = content.time.clock(),
      value = (2 * Math.PI * -clock) + (Math.PI / 2)

    return engine.utility.wrap(value, 0, Math.PI * 2)
  }

  function calculatePreset() {
    const preset = {
      root: {
        amodDepth: 0,
        amodFrequency: 0,
        carrierGain: 1,
        color: 1,
        fmodDepth: rootFrequency,
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
        fmodDepth: 0,
        fmodFrequency: 0,
        gain: 1/4,
      },
    }

    // Amplitude modulation
    const time = content.time.value()

    preset.root.amodDepth = engine.utility.lerp(1/8, 1/2, rootAmodDepth.value(time / 60))
    preset.root.amodFrequency = engine.utility.lerpExp(1/16, 4, rootAmodFrequency.value(time / 60), 6)
    preset.third.amodDepth = engine.utility.lerp(1/8, 1/2, thirdAmodDepth.value(time / 60))
    preset.third.amodFrequency = engine.utility.lerpExp(1/16, 4, thirdAmodFrequency.value(time / 60), 6)

    preset.root.carrierGain = 1 - preset.root.amodDepth
    preset.third.carrierGain = 1 - preset.third.amodDepth

    // Apply color over cycle
    const cycle = content.time.cycle()

    const color = cycle >= cycleFullyVisible
      ? engine.utility.lerpExp(1, 8, engine.utility.scale(cycle, cycleFullyVisible, 1, 1, 0), 2)
      : 8

    preset.root.color = color
    preset.third.color = color

    // Adjust sub mod rate over cycle
    preset.sub.modFrequency = engine.utility.lerpExp(6, 8, cycle, 2)

    // Apply fade out below surface
    const surface = content.surface.current()
    const {z} = engine.position.getVector()

    if (z < surface) {
      const depthFactor = engine.utility.scale(z, surface, surface - fadeDepth, 1, 0)

      preset.root.color *= depthFactor
      preset.sub.gain *= depthFactor
      preset.third.color *= depthFactor
    }

    // Apply fade out below horizon
    const clock = content.time.clock()

    if (!engine.utility.between(clock, clockPostRise, clockPreSet)) {
      let timeFactor = clock <= clockPostRise
        ? engine.utility.scale(clock, clockPostRise, clockPreRise, 1, 0)
        : engine.utility.scale(clock, clockPreSet, clockPostSet, 1, 0)

      timeFactor = engine.utility.clamp(timeFactor, 0, 1)

      preset.root.gain *= timeFactor ** 3
      preset.sub.gain *= timeFactor ** 2
      preset.third.color *= timeFactor
      preset.third.gain *= timeFactor ** 4
    }

    return preset
  }

  function createBinaural(relative) {
    binaural = engine.audio.binaural.create(relative).to(bus)
  }

  function createSynth(preset) {
    const fader = context.createGain()

    const root = engine.audio.synth.createMod({
      amodDepth: preset.root.amodDepth,
      amodFrequency: preset.root.amodFrequency,
      carrierFrequency: rootFrequency,
      carrierGain: preset.root.carrierGain,
      carrierType: 'triangle',
      fmodDepth: preset.root.fmodDepth,
      fmodFrequency: preset.root.fmodFrequency,
      gain: preset.root.gain,
    }).shaped(
      syngen.audio.shape.warm()
    ).filtered({
      frequency: rootFrequency * preset.root.color,
    }).connect(fader)

    const third = engine.audio.synth.createMod({
      amodDepth: preset.third.amodDepth,
      amodFrequency: preset.third.amodFrequency,
      carrierFrequency: thirdFrequency,
      carrierGain: preset.third.carrierGain,
      carrierType: 'triangle',
      fmodDepth: preset.third.fmodDepth,
      fmodFrequency: preset.third.fmodFrequency,
      gain: preset.third.gain,
    }).shaped(
      syngen.audio.shape.warm()
    ).filtered({
      frequency: thirdFrequency * preset.third.color,
    }).connect(fader)

    const sub = engine.audio.synth.createAm({
      carrierFrequency: subFrequency,
      carrierGain: 5/8,
      gain: preset.sub.gain,
      modDepth: 3/8,
      modFrequency: preset.sub.modFrequency,
    }).connect(fader)

    binaural.from(fader)

    synth = {
      fader,
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

    // Fade in
    synth.fader.gain.value = engine.const.zeroGain
    engine.audio.ramp.linear(synth.fader.gain, 1, 1/32)
  }

  function teardown() {
    if (synth) {
      // Fade out
      engine.audio.ramp.linear(synth.fader.gain, engine.const.zeroGain, 1/32)
      synth.stop(engine.audio.time(1/32))
    }

    binaural = undefined
    synth = undefined
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
      const isMuted = content.audio.mixer.bus.music.isMuted(),
        surface = content.surface.current()

      const {z} = engine.position.getVector()

      if (isMuted || z <= surface - fadeDepth) {
        teardown()
        return this
      }

      const clock = content.time.clock()

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

  content.audio.surface.sun.update()
})

engine.state.on('reset', () => content.audio.surface.sun.reset())
