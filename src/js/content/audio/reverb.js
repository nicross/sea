content.audio.reverb = (() => {
  const reverbGain = engine.audio.mixer.auxiliary.reverb.param.gain,
    send = engine.audio.mixer.send.reverb.create()

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

  let gain = engine.const.zeroGain

  send.update({
    x: 0,
    y: 0,
  })

  machine.on('enter-cave', () => {
    engine.const.speedOfSound = content.const.underwaterSpeedOfSound
    gain = engine.utility.fromDb(-3)

    engine.audio.ramp.linear(engine.audio.mixer.auxiliary.reverb.param.gain, gain, 0.125)
    engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.medium())
  })

  machine.on('enter-surface', () => {
    engine.const.speedOfSound = content.const.normalSpeedOfSound
    gain = engine.const.zeroGain

    engine.audio.ramp.linear(engine.audio.mixer.auxiliary.reverb.param.gain, gain, 0.125)
    engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.large())
  })

  machine.on('enter-underwater', () => {
    engine.const.speedOfSound = content.const.underwaterSpeedOfSound
    gain = engine.utility.fromDb(-3)

    engine.audio.ramp.linear(engine.audio.mixer.auxiliary.reverb.param.gain, gain, 0.125)
    engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.large())
  })

  return {
    from: function (...args) {
      send.from(...args)
      return this
    },
    import: function () {
      const {x, y, z} = engine.position.getVector()

      if (z >= 0) {
        machine.change('surface')
      } else if (z >= content.terrain.floor.value(x, y)) {
        machine.change('underwater')
      } else {
        machine.change('cave')
      }

      return this
    },
    is: (state) => machine.is(state),
    onScanComplete: function () {
      const duration = 2,
        now = engine.audio.time()

      reverbGain.setValueAtTime(gain/4, now + duration/2)
      reverbGain.exponentialRampToValueAtTime(gain, now + duration)

      return this
    },
    onScanTrigger: function () {
      engine.audio.ramp.exponential(reverbGain, gain/4, 1)
      return this
    },
    update: function () {
      const {x, y, z} = engine.position.getVector()

      if (machine.is('surface')) {
        if (z < 0) {
          machine.dispatch('descend')
        }
        return this
      }

      if (machine.is('underwater')) {
        if (z >= 0) {
          machine.dispatch('ascend')
        } else if (z < content.const.lightZone && z < content.terrain.floor.value(x, y)) {
          machine.dispatch('descend')
        }
        return this
      }

      if (machine.is('cave')) {
        if (z >= content.terrain.floor.value(x, y)) {
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

  content.audio.reverb.update()
})

engine.state.on('import', () => content.audio.reverb.import())

engine.ready(() => {
  content.scan.on('complete', () => content.audio.reverb.onScanComplete())
  content.scan.on('trigger', () => content.audio.reverb.onScanTrigger())
})
