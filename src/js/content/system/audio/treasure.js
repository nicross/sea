content.system.audio.treasure = (() => {
  const baseGain = engine.utility.fromDb(-15),
    context = engine.audio.context(),
    f1 = engine.utility.midiToFrequency(69),
    f2 = engine.utility.midiToFrequency(76),
    output = context.createGain(),
    props = new Set()

  let synth,
    timer

  output.gain.value = engine.utility.fromDb(-3)

  function createSynth() {
    // TODO: More complexity
    synth = engine.audio.synth.createSimple({

    }).connect(output)
  }

  function pulse() {
    const d1 = engine.utility.random.float(-12.5, 12.5),
      d2 = engine.utility.random.float(-12.5, 12.5)

    const attack = 1/32,
      decay = 1/2,
      release = 1

    const duration = 2,
      now = engine.audio.time()

    synth.param.detune.setValueAtTime(0, now)
    synth.param.detune.exponentialRampToValueAtTime(d1, now + attack)
    synth.param.detune.linearRampToValueAtTime(0, now + attack + decay)
    synth.param.detune.exponentialRampToValueAtTime(d2, now + attack + decay)
    synth.param.detune.linearRampToValueAtTime(0, now + attack + decay + attack)

    synth.param.frequency.setValueAtTime(f2, now)
    synth.param.frequency.exponentialRampToValueAtTime(f1, now + attack)
    synth.param.frequency.setValueAtTime(f1, now + attack + decay)
    synth.param.frequency.exponentialRampToValueAtTime(f2, now + attack + decay + attack)

    synth.param.gain.setValueAtTime(baseGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + attack)
    synth.param.gain.exponentialRampToValueAtTime(baseGain, now + attack + decay)
    synth.param.gain.exponentialRampToValueAtTime(1, now + attack + decay + attack)
    synth.param.gain.exponentialRampToValueAtTime(baseGain, now + attack + decay + attack + release)

    timer = context.createConstantSource()
    timer.start()
    timer.onended = pulse
    timer.stop(now + duration)
  }

  function start() {
    createSynth()
    pulse()
  }

  function stop() {
    if (synth) {
      destroySynth()
      synth = null
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
    getFrequency: () => f1,
    output: () => output,
    remove: function (prop) {
      props.delete(prop)

      if (!props.size) {
        start()
      }

      return this
    },
    reset: function () {
      stop()
      props.clear()
      return this
    },
  }
})()

engine.state.on('reset', () => content.system.audio.treasure.reset())
