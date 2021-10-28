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

app.ready(() => {
  // Initial mix
  engine.audio.mixer.master.param.gain.value = engine.const.zeroGain
  content.audio.mixer.bus.environment.bus().gain.value = engine.const.zeroGain

  // Game state changes
  app.state.screen.on('before-game-pause', () => app.state.game.dispatch('pause'))
  app.state.screen.on('before-gameMenu-mainMenu', () => app.state.game.dispatch('exit'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.game.dispatch('load'))
  app.state.screen.on('before-newGame-new', () => app.state.game.dispatch('new'))

  // XXX: before-gameMenu-resume does not support directly changing to game screen, e.g. fast traveling
  app.state.screen.on('enter-game', () => {
    if (app.state.game.is('paused')) {
      app.state.game.dispatch('resume')
    }
  })

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

  engine.audio.ramp.set(content.audio.mixer.bus.environment.bus().gain, engine.const.zeroGain)

  app.splash.applyRandom()
})

app.state.game.on('exit-none', () => {
  content.idle.touch()
  engine.audio.ramp.linear(content.audio.mixer.bus.environment.bus().gain, app.settings.computed.environmentVolume, 0.5)
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
