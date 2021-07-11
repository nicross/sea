content.audio.treasure = (() => {
  const baseGain = engine.utility.fromDb(-12),
    context = engine.audio.context(),
    f0 = engine.utility.midiToFrequency(33),
    f1 = engine.utility.midiToFrequency(69),
    f2 = engine.utility.midiToFrequency(76),
    gain = engine.utility.fromDb(-6),
    harmonyOutput = context.createGain(),
    melodyOutput = context.createGain(),
    props = new Set()

  let count = 0,
    harmonySynth,
    melodySynth,
    timer

  harmonyOutput.gain.value = gain
  melodyOutput.gain.value = gain

  function createHarmonySynth() {
    harmonySynth = engine.audio.synth.createAm({
      carrierGain: 2/3,
      carrierFrequency: f0,
      carrierType: 'sawtooth',
      modDepth: -1/3,
      modFrequency: 1,
    }).shaped(
      engine.audio.shape.distort()
    ).connect(harmonyOutput)

    engine.audio.ramp.linear(harmonySynth.param.gain, engine.utility.fromDb(-9), 0.5)
  }

  function createMelodySynth() {
    melodySynth = engine.audio.synth.createFm({
      carrierType: 'triangle',
      modDepth: f2 / 2,
      modFrequency: f1 * 8.13,
      modType: 'triangle',
    }).connect(melodyOutput)
  }

  function pulse() {
    let createdSynth = false

    if (!melodySynth) {
      createMelodySynth()
      createdSynth = true
    }

    const d1 = engine.utility.random.float(-12.5, 12.5),
      d2 = engine.utility.random.float(-12.5, 12.5)

    const attack = 1/64,
      decay = 1/2,
      release = 1

    const duration = 2,
      isFirstCount = count % 4 == 0,
      isLastCount = count % 4 == 3,
      now = engine.audio.time()

    melodySynth.param.detune.setValueAtTime(0, now)
    melodySynth.param.detune.exponentialRampToValueAtTime(d1, now + attack)
    melodySynth.param.detune.linearRampToValueAtTime(0, now + decay)
    melodySynth.param.detune.exponentialRampToValueAtTime(d2, now + decay + attack)
    melodySynth.param.detune.linearRampToValueAtTime(0, now + decay + release)

    if (isLastCount) {
      const d3 = engine.utility.random.float(-12.5, 12.5)
      melodySynth.param.detune.exponentialRampToValueAtTime(d3, now + decay + release + attack)
      melodySynth.param.detune.linearRampToValueAtTime(0, now + duration)
    }

    if (isFirstCount) {
      melodySynth.param.frequency.setValueAtTime(f1 * 2, now)
    } else {
      melodySynth.param.frequency.setValueAtTime(f2, now)
    }

    melodySynth.param.frequency.exponentialRampToValueAtTime(f1, now + attack)
    melodySynth.param.frequency.setValueAtTime(f1, now + decay)
    melodySynth.param.frequency.exponentialRampToValueAtTime(f2, now + decay + attack)

    if (isLastCount) {
      melodySynth.param.frequency.setValueAtTime(f2, now + decay + release)
      melodySynth.param.frequency.exponentialRampToValueAtTime(f1 * 2, now + decay + release + attack)
    }

    if (!createdSynth) {
      melodySynth.param.gain.setValueAtTime(baseGain, now)
    }

    melodySynth.param.gain.exponentialRampToValueAtTime(1, now + attack)
    melodySynth.param.gain.exponentialRampToValueAtTime(baseGain * 2, now + attack + decay)
    melodySynth.param.gain.exponentialRampToValueAtTime(1, now + decay + attack)
    melodySynth.param.gain.exponentialRampToValueAtTime(baseGain, now + decay + release)

    if (isLastCount) {
      melodySynth.param.gain.exponentialRampToValueAtTime(1/4, now + decay + release + attack)
      melodySynth.param.gain.exponentialRampToValueAtTime(baseGain, now + duration)
    }

    timer = context.createConstantSource()
    timer.start()
    timer.onended = pulse
    timer.stop(now + duration)

    count += 1
  }

  function start() {
    count = 1
    pulse()

    createHarmonySynth()
  }

  function stop() {
    if (harmonySynth) {
      harmonySynth.stop()
      harmonySynth = null
    }

    if (melodySynth) {
      melodySynth.stop()
      melodySynth = null
    }

    if (timer) {
      timer.onended = null
      timer.stop()
      timer = null
    }
  }

  return {
    add: function (prop) {
      if (!props.size) {
        start()
      }

      props.add(prop)

      return this
    },
    duck: function () {
      for (const output of [harmonyOutput, melodyOutput]) {
        engine.audio.ramp.exponential(output.gain, gain/32, 1/2)
      }

      return this
    },
    getHarmonyFrequency: () => f0,
    getMelodyFrequency: () => f1,
    harmonyOutput: () => harmonyOutput,
    melodyOutput: () => melodyOutput,
    remove: function (prop) {
      props.delete(prop)

      if (!props.size) {
        stop()
      }

      return this
    },
    reset: function () {
      stop()
      props.clear()
      return this
    },
    unduck: function () {
      const duration = content.const.scanCooldown,
        now = engine.audio.time()

      for (const output of [harmonyOutput, melodyOutput]) {
        output.gain.setValueAtTime(gain/32, now + duration/2)
        output.gain.exponentialRampToValueAtTime(gain, now + duration)
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('trigger', () => content.audio.treasure.duck())
  content.scan.on('complete', () => content.audio.treasure.unduck())
})

engine.state.on('reset', () => content.audio.treasure.reset())
