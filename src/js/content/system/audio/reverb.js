content.system.audio.reverb = (() => {
  const send = engine.audio.send.reverb.create()

  const machine = engine.utility.machine.create({
    state: 'none',
    transition: {
      none: {},
      cave: {
        ascend: function() {
          this.change('underwater')
        },
      },
      surface: {
        descend: function() {
          this.change('underwater')
        },
      },
      underwater: {
        ascend: function() {
          this.change('surface')
        },
        descend: function() {
          this.change('cave')
        },
      },
    },
  })

  send.update({
    x: 0,
    y: 0,
  })

  machine.on('enter-cave', () => {
    engine.audio.mixer.auxiliary.reverb.setGain(engine.utility.fromDb(-3), 0.125)
    engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.medium())
  })

  machine.on('enter-surface', () => {
    engine.audio.mixer.auxiliary.reverb.setGain(engine.const.zeroGain, 0.125)
  })

  machine.on('enter-underwater', () => {
    engine.audio.mixer.auxiliary.reverb.setGain(engine.utility.fromDb(-3), 0.125)
    engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.large())
  })

  return {
    from: function (...args) {
      send.from(...args)
      return this
    },
    import: function () {
      // Wait for next event loop so everything has reset
      setTimeout(() => {
        const {x, y} = engine.position.get()
        const z = content.system.z.get()

        if (z >= 0) {
          machine.change('surface')
        } else if (z >= content.system.terrain.floor.value(x, y)) {
          machine.change('underwater')
        } else {
          machine.change('cave')
        }
      })
      return this
    },
    update: function () {
      const {x, y} = engine.position.get()
      const z = content.system.z.get()

      if (machine.is('surface')) {
        if (z < 0) {
          machine.dispatch('descend')
        }
        return this
      }

      if (machine.is('underwater')) {
        if (z >= 0) {
          machine.dispatch('ascend')
        } else if (z < content.const.lightZone && z < content.system.terrain.floor.value(x, y)) {
          machine.dispatch('descend')
        }
        return this
      }

      if (machine.is('cave')) {
        if (z >= content.system.terrain.floor.value(x, y)) {
          machine.dispatch('ascend')
        }
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({frame, paused}) => {
  if (paused || frame % 15) {
    return
  }

  content.system.audio.reverb.update()
})

engine.state.on('import', (data) => content.system.audio.reverb.import(data))
