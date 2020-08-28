content.system.audio.compass = (() => {
  const bus = content.system.audio.createBus(),
    frequency = engine.utility.midiToFrequency(81),
    tau = Math.PI * 2

  const roses = [
    [Math.PI * 0, 1],
    [Math.PI * 0.125, 0],
    [Math.PI * 0.25, 0.5],
    [Math.PI * 0.375, 0],
    [Math.PI * 0.5, 1],
    [Math.PI * 0.625, 0],
    [Math.PI * 0.75, 0.5],
    [Math.PI * 0.875, 0],
    [Math.PI * 1, 1],
    [Math.PI * 1.125, 0],
    [Math.PI * 1.25, 0.5],
    [Math.PI * 1.375, 0],
    [Math.PI * 1.5, 1],
    [Math.PI * 1.625, 0],
    [Math.PI * 1.75, 0.5],
    [Math.PI * 1.875, 0],
  ]

  let previousAngle = 0

  bus.gain.value = engine.utility.fromDb(-24)

  function getRoseStrength(angle) {
    const max = Math.max(angle, previousAngle),
      min = Math.min(angle, previousAngle)

    for (const [rose, strength] of roses) {
      if (engine.utility.between(rose, min, max)) {
        return strength
      }

      if (!rose && (Math.abs(angle - previousAngle) > Math.PI) && engine.utility.between(tau, previousAngle, angle + tau)) {
        return strength
      }
    }

    return false
  }

  function triggerRose(strength) {
    const synth = engine.audio.synth.createSimple({
      frequency,
      type: 'square',
    }).filtered({
      frequency: engine.utility.choose([0.5, 2, 4], strength) * frequency,
    }).connect(bus)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/64)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.25)

    if (strength) {
      const detune = strength == 1
        ? 1200
        : 700

      synth.param.detune.setValueAtTime(detune, now)
      synth.param.detune.linearRampToValueAtTime(engine.const.zero, now + 0.25)
    }

    synth.stop(now + 0.25)
  }

  return {
    import: function ({position}) {
      previousAngle = position && position.angle
        ? position.angle
        : 0

      return this
    },
    update: function () {
      const {angle} = engine.position.get()

      if (angle == previousAngle) {
        return this
      }

      const strength = getRoseStrength(angle)

      if (strength !== false) {
        triggerRose(strength)
      }

      previousAngle = angle

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.compass.update()
})

engine.state.on('import', (data) => content.system.audio.compass.import(data))
