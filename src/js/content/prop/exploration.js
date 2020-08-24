content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  glitter: function () {
    const strength = Math.random()

    const duration = engine.utility.lerp(0.5, 2, strength),
      frequency = engine.utility.choose(content.system.soundtrack.harmonics(), Math.random()),
      gain = engine.utility.fromDb(engine.utility.lerp(-24, -18, strength))

    const synth = engine.audio.synth.createSimple({
      frequency,
    }).connect(this.output.input)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1500)
  },
  onUpdate: function () {
    this.handlePeriodic({
      delay: () => this.hasPeriodic('glitter') ? engine.const.zeroTime : 1,
      key: 'glitter',
      trigger: () => this.glitter(),
    })
  },
})
