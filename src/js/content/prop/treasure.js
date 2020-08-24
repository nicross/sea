content.prop.treasure = content.prop.base.invent({
  name: 'Treasure',
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.input.gain, engine.const.zeroGain, 1/4)
    content.system.treasure.collect(this)
    return this
  },
  onUpdate: function () {
    if (this.isCollected) {
      return this
    }

    if (this.distance <= 0) {
      return this.collect()
    }

    this.handlePeriodic({
      delay: () => engine.utility.random.float(0, 0.5),
      key: 'shiny',
      trigger: () => this.shiny(),
    })
  },
  shiny: function () {
    const d1 = engine.utility.random.float(-12.5, 12.5),
      d2 = engine.utility.random.float(-12.5, 12.5),
      f1 = engine.utility.midiToFrequency(69),
      f2 = engine.utility.midiToFrequency(76),
      gain = engine.utility.fromDb(-3)

    // TODO: FM synthesis, filtered triangles
    const synth = engine.audio.synth.createSimple({

    }).connect(this.output.input)

    const now = engine.audio.time()

    const attack = 1/32,
      decay = 1/2,
      release = 1

    synth.param.detune.setValueAtTime(d1, now)
    synth.param.detune.linearRampToValueAtTime(0, now + attack + decay)
    synth.param.detune.exponentialRampToValueAtTime(d2, now + attack + decay)
    synth.param.detune.linearRampToValueAtTime(0, now + attack + decay + attack)

    synth.param.frequency.setValueAtTime(f1, now)
    synth.param.frequency.setValueAtTime(f1, now + attack + decay)
    synth.param.frequency.exponentialRampToValueAtTime(f2, now + attack + decay + attack)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + attack)
    synth.param.gain.exponentialRampToValueAtTime(gain/128, now + attack + decay)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + attack + decay + attack)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + attack + decay + attack + release)

    synth.stop(now + attack + decay + attack + release)

    return engine.utility.timing.promise(2000)
  },
})
