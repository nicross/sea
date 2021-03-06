app.updates.register('1.3.0', () => {
  updateGame()
  updateSettings()

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    game.time = {
      offset: 0,
      time: game.time,
    }

    app.storage.setGame(game)
  }

  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    // Convert [5, 30] to [5, 25]
    if (settings.streamerLimit) {
      settings.streamerLimit = engine.utility.lerp(5, 30, settings.streamerLimit)
      settings.streamerLimit = Math.min(25, settings.streamerLimit)
      settings.streamerLimit = engine.utility.scale(settings.streamerLimit, 5, 25, 0, 1)
    }

    app.storage.setSettings(settings)
  }
})
