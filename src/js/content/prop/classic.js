content.prop.classic = content.prop.base.invent({
  name: 'Classic',
  play: function ({
    frequency,
    velocity,
  }) {
    velocity *= Math.random()

    const duration = engine.utility.lerp(1, 2, velocity),
      gain = engine.utility.fromDb(engine.utility.lerp(-21, -15, velocity))

    const synth = engine.audio.synth.createSimple({
      frequency,
      type: 'triangle',
    }).connect(this.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})
