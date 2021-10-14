content.prop.classic = content.prop.node.invent({
  name: 'Classic',
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
    velocity,
  }) {
    this.frequency = frequency
    velocity *= Math.random()

    const detune = engine.utility.random.float(-10, 10),
      duration = engine.utility.lerp(1, 2, velocity),
      gain = engine.utility.fromDb(engine.utility.lerp(-13.5, -7.5, velocity))

    this.synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type: 'triangle',
    }).filtered({
      frequency: this.calculateFilterFrequency(),
    }).connect(this.output)

    const now = engine.audio.time()

    this.synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    this.synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    this.synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    this.synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})
