content.audio.treasure = (() => {
  const baseGain = engine.utility.fromDb(-12),
    context = engine.audio.context(),
    f1 = engine.utility.midiToFrequency(69),
    f2 = engine.utility.midiToFrequency(76),
    gain = engine.utility.fromDb(-6),
    output = context.createGain(),
    props = new Set()

  let count = 0,
    filter,
    lfo,
    synth,
    timer

  output.gain.value = gain

  function createLfo() {
    filter = context.createBiquadFilter()
    filter.frequency.value = f1 * 6

    synth.disconnect(output)
    synth.connect(filter)
    filter.connect(output)

    lfo = engine.audio.synth.createLfo({
      depth: f1 * 3,
      frequency: 4,
    }).connect(filter.frequency)
  }

  function createSynth() {
    synth = engine.audio.synth.createFm({
      carrierType: 'triangle',
      modDepth: f2 / 2,
      modFrequency: f1 * 8.13,
      modType: 'triangle',
    }).connect(output)
  }

  function pulse() {
    let createdSynth = false

    if (!synth) {
      createSynth()
      createdSynth = true
    }

    if (!lfo) {
      createLfo()
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

    synth.param.detune.setValueAtTime(0, now)
    synth.param.detune.exponentialRampToValueAtTime(d1, now + attack)
    synth.param.detune.linearRampToValueAtTime(0, now + decay)
    synth.param.detune.exponentialRampToValueAtTime(d2, now + decay + attack)
    synth.param.detune.linearRampToValueAtTime(0, now + decay + release)

    if (isLastCount) {
      const d3 = engine.utility.random.float(-12.5, 12.5)
      synth.param.detune.exponentialRampToValueAtTime(d3, now + decay + release + attack)
      synth.param.detune.linearRampToValueAtTime(0, now + duration)
    }

    if (isFirstCount) {
      synth.param.frequency.setValueAtTime(f1 * 2, now)
    } else {
      synth.param.frequency.setValueAtTime(f2, now)
    }

    synth.param.frequency.exponentialRampToValueAtTime(f1, now + attack)
    synth.param.frequency.setValueAtTime(f1, now + decay)
    synth.param.frequency.exponentialRampToValueAtTime(f2, now + decay + attack)

    if (isLastCount) {
      synth.param.frequency.setValueAtTime(f2, now + decay + release)
      synth.param.frequency.exponentialRampToValueAtTime(f1 * 2, now + decay + release + attack)
    }

    if (!createdSynth) {
      synth.param.gain.setValueAtTime(baseGain, now)
    }

    synth.param.gain.exponentialRampToValueAtTime(1, now + attack)
    synth.param.gain.exponentialRampToValueAtTime(baseGain * 2, now + attack + decay)
    synth.param.gain.exponentialRampToValueAtTime(1, now + decay + attack)
    synth.param.gain.exponentialRampToValueAtTime(baseGain, now + decay + release)

    if (isLastCount) {
      synth.param.gain.exponentialRampToValueAtTime(1/4, now + decay + release + attack)
      synth.param.gain.exponentialRampToValueAtTime(baseGain, now + duration)
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
  }

  function stop() {
    if (filter) {
      filter.disconnect()
      filter = null
    }

    if (lfo) {
      lfo.stop()
      lfo = null
    }

    if (synth) {
      synth.stop()
      synth = null
    }

    if (timer) {
      timer.onended = null
      timer.stop()
      timer = null
    }
  }

  function teardownLfo() {
    synth.disconnect(filter)
    synth.connect(output)

    filter.disconnect()
    filter = null

    lfo.stop()
    lfo = null
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
      engine.audio.ramp.exponential(output.gain, gain/32, 1/2)
      return this
    },
    getFrequency: () => f1,
    output: () => output,
    remove: function (prop) {
      props.delete(prop)

      if (!props.size) {
        stop()
      }

      return this
    },
    rebuildFilters: function () {
      if (synth && lfo) {
        teardownLfo()
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

      output.gain.setValueAtTime(gain/32, now + duration/2)
      output.gain.exponentialRampToValueAtTime(gain, now + duration)

      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('trigger', () => content.audio.treasure.duck())
  content.scan.on('complete', () => content.audio.treasure.unduck())
})

engine.state.on('reset', () => content.audio.treasure.reset())
