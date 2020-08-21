content.system.reverb = (() => {
  const send = engine.audio.send.reverb.create()

  send.update({
    x: 0,
    y: 0,
  })

  engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.large())
  engine.audio.mixer.auxiliary.reverb.setGain(engine.const.zeroGain)

  // TODO: Update reverb impulse based on whether in cave?

  return {
    from: function (...args) {
      send.from(...args)
      return this
    },
    import: function ({z}) {
      const gain = z > 0 ? engine.const.zeroGain : engine.utility.fromDb(-3)
      engine.audio.mixer.auxiliary.reverb.setGain(gain)
      return this
    },
    surface: function () {
      engine.audio.mixer.auxiliary.reverb.setGain(engine.const.zeroGain, 0.125)
      return this
    },
    underwater: function () {
      engine.audio.mixer.auxiliary.reverb.setGain(engine.utility.fromDb(-3), 0.125)
      return this
    },
  }
})()

engine.state.on('import', (data) => content.system.reverb.import(data))
content.system.movement.on('transition-surface', () => content.system.reverb.surface())
content.system.movement.on('transition-underwater', () => content.system.reverb.underwater())
