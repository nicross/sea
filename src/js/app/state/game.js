app.state.mode = engine.utility.machine.create({
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
  app.state.screen.on('before-game-pause', () => app.state.mode.dispatch('pause'))
  app.state.screen.on('before-gameMenu-exitToMenu', () => app.state.mode.dispatch('exit'))
  app.state.screen.on('before-gameMenu-resume', () => app.state.mode.dispatch('resume'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.mode.dispatch('load'))
  app.state.screen.on('before-mainMenu-newGame', () => app.state.mode.dispatch('new'))
})

app.state.mode.on('before-none-load', () => {
  engine.state.import(
    app.storage.getGame()
  )
})

app.state.mode.on('before-none-new', () => {
  app.storage.clearGame()

  engine.state.import({
    position: {
      angle: 0,
      x: 0,
      y: 0,
    },
    seed: Math.random(),
    z: 0,
  })
})

app.state.mode.on('enter-paused', () => {
  engine.audio.ramp.exponential(engine.audio.mixer.master.param.gain, engine.const.zeroGain, 1)
  app.autosave.disable().trigger()
  engine.loop.pause()
})

app.state.mode.on('enter-running', () => {
  engine.audio.ramp.exponential(engine.audio.mixer.master.param.gain, 1, 1)
  app.autosave.enable()
  engine.loop.resume()
})
