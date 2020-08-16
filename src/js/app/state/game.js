app.state.game = engine.utility.machine.create({
  state: 'none',
  transition: {
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

app.on('activate', () => {
  engine.audio.ramp.set(engine.audio.mixer.master.param.gain, engine.const.zeroGain)
  app.state.screen.on('before-game-pause', () => app.state.game.dispatch('pause'))
  app.state.screen.on('before-gameMenu-mainMenu', () => app.state.game.dispatch('exit'))
  app.state.screen.on('before-gameMenu-resume', () => app.state.game.dispatch('resume'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.game.dispatch('load'))
  app.state.screen.on('before-mainMenu-newGame', () => app.state.game.dispatch('new'))
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
      angle: Math.PI / 2,
      x: 0,
      y: 0,
    },
    seed: Math.random(),
    z: 0,
  })
})

app.state.game.on('enter-paused', () => {
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, engine.const.zeroGain, 0.5)
  app.autosave.disable().trigger()
  engine.loop.pause()
})

app.state.game.on('enter-running', () => {
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, app.settings.computed.masterVolume, 0.5)
  app.autosave.enable()
  engine.loop.resume()
})
