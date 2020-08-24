content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  glitter: function () {
    const {angle} = engine.position.get()
    const strength = Math.random()

    const distanceRatio = 1 - (this.distance / engine.const.streamerRadius),
      facingRatio = engine.utility.scale(Math.cos(this.atan2 - angle), -1, 1, 0, 1),
      frequencyRoll = engine.utility.lerpRandom([0, 0.25], [0.75, 1], distanceRatio * facingRatio)

    const duration = engine.utility.lerp(1, 2, strength),
      frequency = engine.utility.choose(content.system.soundtrack.harmonics(), frequencyRoll),
      gain = engine.utility.fromDb(engine.utility.lerp(-24, -18, strength))

    const synth = engine.audio.synth.createSimple({
      frequency,
    }).connect(this.output.input)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
  onUpdate: function () {
    this.handlePeriodic({
      delay: () => this.hasPeriodic('glitter') ? engine.const.zeroTime : 1,
      key: 'glitter',
      trigger: () => this.glitter(),
    })
  },
})
