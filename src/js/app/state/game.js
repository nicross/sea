app.state.game = engine.utility.machine.create({
  state: 'initial',
  transition: {
    initial: {
      activate: function () {
        this.change('none')
      },
    },
    none: {
      load: function () {
        this.change('running')
      },
      new: function () {
        this.change('running')
      },
    },
    paused: {
      exit: function () {
        this.change('none')
      },
      resume: function () {
        this.change('running')
      },
    },
    running: {
      pause: function () {
        this.change('paused')
      },
    },
  },
})

engine.ready(() => {
  // Initial mix
  engine.audio.mixer.master.param.gain.value = engine.const.zeroGain
  content.system.audio.mixer.bus.environment.bus().gain.value = engine.const.zeroGain

  // Game state changes
  app.state.screen.on('before-game-pause', () => app.state.game.dispatch('pause'))
  app.state.screen.on('before-gameMenu-mainMenu', () => app.state.game.dispatch('exit'))
  app.state.screen.on('before-gameMenu-resume', () => app.state.game.dispatch('resume'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.game.dispatch('load'))
  app.state.screen.on('before-mainMenu-newGame', () => app.state.game.dispatch('new'))

  app.state.game.dispatch('activate')
})

app.state.game.on('before-none-load', () => {
  engine.state.import(
    app.storage.getGame()
  )
})

app.state.game.on('before-none-new', () => {
  app.storage.clearGame()

  engine.state.import({
    position: {
      quaternion: engine.utility.quaternion.identity(),
      x: 0,
      y: 0,
      z: content.const.underwaterTurboMaxVelocity + (content.const.waveHeightMax / 2),
    },
    time: {
      offset: (content.const.dayDuration * 0.25) - 3,
    },
    seed: Math.random(),
  })

  app.autosave.trigger()
})

app.state.game.on('enter-none', () => {
  engine.loop.resume()

  // Fade volume
  const gain = app.settings.computed.mainVolume * app.settings.computed.pausedVolume
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 0.5)

  engine.audio.ramp.set(content.system.audio.mixer.bus.environment.bus().gain, engine.const.zeroGain)

  // Generate scene
  const isRise = Math.random() > 0.5
  const isSun = Math.random() > 0.5

  const yawNoise = engine.utility.random.float(-1/120, 1/120)

  const yaw = isRise
    ? Math.PI * (1/8 + yawNoise)
    : Math.PI * (9/8 + yawNoise)

  const offset = isSun
    ? (
      isRise
        ? engine.utility.random.float(0.225, 0.275)
        : engine.utility.random.float(0.7, 0.725)
      )
    : (
      isRise
        ? engine.utility.random.float(0.725, 0.775)
        : engine.utility.random.float(0.2, 0.225)
      )

  const scene = {
    position: {
      quaternion: engine.utility.quaternion.fromEuler({
        yaw,
      }),
      x: 0,
      y: 0,
      z: 0,
    },
    seed: Math.random(),
    time: {
      offset: offset * content.const.dayDuration,
    },
  }

  engine.state.import(scene)
})

app.state.game.on('exit-none', () => {
  engine.audio.ramp.linear(content.system.audio.mixer.bus.environment.bus().gain, app.settings.computed.environmentVolume, 0.5)
})

app.state.game.on('enter-paused', () => {
  const gain = app.settings.computed.mainVolume * app.settings.computed.pausedVolume
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 0.5)

  app.autosave.disable().trigger()
  engine.loop.pause()
})

app.state.game.on('enter-running', () => {
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, app.settings.computed.mainVolume, 0.5)

  app.autosave.enable()
  engine.loop.resume()
})
