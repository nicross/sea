content.system.reverb = (() => {
  const send = engine.audio.send.reverb.create()

  let isCave = false

  send.update({
    x: 0,
    y: 0,
  })

  engine.audio.mixer.auxiliary.reverb.setGain(engine.const.zeroGain)

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
    update: function () {
      const z = content.system.z.get()

      if (z > content.const.lightZone) {
        return this
      }

      const floor = content.system.terrain.floor.currentValue()
      const caveCheck = z < floor

      if (isCave == caveCheck) {
        return this
      }

      isCave = caveCheck

      engine.audio.mixer.auxiliary.reverb.setImpulse(
        isCave
          ? engine.audio.buffer.impulse.medium()
          : engine.audio.buffer.impulse.large()
      )

      return this
    },
  }
})()

engine.loop.on('frame', ({frame, paused}) => {
  if (paused || frame % 15) {
    return
  }

  content.system.reverb.update()
})

engine.state.on('import', (data) => content.system.reverb.import(data))

content.system.movement.on('transition-surface', () => content.system.reverb.surface())
content.system.movement.on('transition-underwater', () => content.system.reverb.underwater())
