content.prop.worm = content.prop.node.invent({
  name: 'Worm',
  onUpdate: function () {
    engine.audio.ramp.set(this.synth.filter.frequency, this.calculateFilterFrequency())
  },
  calculateFilterFrequency: function () {
    const cos = Math.cos(Math.atan2(this.relative.y, this.relative.x)),
      ratio = engine.utility.scale(cos, -1, 1, 0, 1)

    const color = engine.utility.lerpExp(1, 4, ratio, 2),
      frequency = (this.frequency || 0) * color

    return engine.utility.clamp(frequency, engine.const.minFrequency, engine.const.maxFrequency)
  },
  play: function ({
    frequency,
  }) {
    this.frequency = frequency

    const detune = engine.utility.random.float(-25, 25),
      duration = 0.25,
      gain = engine.utility.fromDb(-7.5)

    this.synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type: 'triangle',
    }).filtered({
      frequency: this.calculateFilterFrequency(),
    }).connect(this.output)

    const now = engine.audio.time()

    this.synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    this.synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/64)
    this.synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    this.synth.param.detune.setValueAtTime(detune, now)
    this.synth.param.detune.linearRampToValueAtTime(detune + 0, now + duration)

    this.synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})
