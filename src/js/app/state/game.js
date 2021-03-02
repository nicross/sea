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

engine.ready(() => {
  engine.audio.ramp.set(engine.audio.mixer.master.param.gain, engine.const.zeroGain)

  // Game state changes
  app.state.screen.on('before-game-pause', () => app.state.game.dispatch('pause'))
  app.state.screen.on('before-gameMenu-mainMenu', () => app.state.game.dispatch('exit'))
  app.state.screen.on('before-gameMenu-resume', () => app.state.game.dispatch('resume'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.game.dispatch('load'))
  app.state.screen.on('before-mainMenu-newGame', () => app.state.game.dispatch('new'))

  // Fast travel actions
  // TODO: Refactor to dispatch events
  app.state.screen.on('before-fastTravel-floor', () => {
    const position = engine.position.getVector()
    const floor = content.system.terrain.floor.value(position.x, position.y) + 5

    const distance = Math.abs(position.z - floor),
      travelTime = distance / content.const.underwaterTurboMaxVelocity

    content.system.time.incrementOffset(travelTime)

    engine.position.setVector({
      ...position,
      z: floor,
    })

    // Force hard reset
    engine.state.import({
      ...engine.state.export(),
    })

    app.stats.fastTravels.increment()
  })

  app.state.screen.on('before-fastTravel-origin', () => {
    const position = engine.position.getVector()
    const distance = position.distance()

    const velocity = position.z > 0
      ? content.const.surfaceTurboMaxVelocity
      : content.const.underwaterTurboMaxVelocity

    const travelTime = distance / velocity
    content.system.time.incrementOffset(travelTime)

    const surface = content.system.surface.height(0, 0) + engine.const.zero

    engine.position.setVector({
      x: 0,
      y: 0,
      z: surface,
    })

    // Force hard reset
    engine.state.import({
      ...engine.state.export(),
    })

    app.stats.fastTravels.increment()
  })

  app.state.screen.on('before-fastTravel-surface', () => {
    const position = engine.position.getVector()

    const distance = Math.abs(position.z),
      travelTime = distance / content.const.underwaterTurboMaxVelocity

    content.system.time.incrementOffset(travelTime)

    const surface = content.system.surface.height(0, 0) + engine.const.zero

    engine.position.setVector({
      ...position,
      z: surface,
    })

    // Force hard reset
    engine.state.import({
      ...engine.state.export(),
    })

    app.stats.fastTravels.increment()
  })
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
      quaternion: engine.utility.quaternion.fromEuler({yaw: Math.PI / 8}),
      x: 0,
      y: 0,
      z: content.const.underwaterTurboMaxVelocity + (content.const.waveHeightMax / 2),
    },
    time: {
      offset: 7.45 * 60,
    },
    seed: Math.random(),
  })

  app.autosave.trigger()
})

app.state.game.on('enter-paused', () => {
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, engine.const.zeroGain, 0.5)
  app.autosave.disable().trigger()
  engine.loop.pause()
})

app.state.game.on('enter-running', () => {
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, app.settings.computed.mainVolume, 0.5)
  app.autosave.enable()
  engine.loop.resume()
})

content.system.scan.on('trigger', () => {
  engine.loop.pause()
})

content.system.scan.on('recharge', () => {
  if (app.state.game.is('running')) {
    engine.loop.resume()
  }
})
