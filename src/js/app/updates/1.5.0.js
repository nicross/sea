app.updates.register('1.5.0-beta', () => {
  updateGame()
  updateSettings()

  function updateGame() {
    const game = app.storage.getGame()

    // Clear scanned points
    if (game.exploration) {
      game.exploration = []
    }

    // Prevent stuck in terrain
    if (game.position) {
      game.position.z = Math.max(game.position.z, content.const.lightZone)
    }

    app.storage.setGame(game)
  }

  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    if ('drawDistance' in settings) {
      settings.drawDistanceStatic = app.updates.rescaleSetting(settings.drawDistance, 10, 75, 5)
      delete settings.drawDistance
    }

    if ('streamerLimit' in settings) {
      settings.streamerLimit = app.updates.rescaleSetting(settings.streamerLimit, 5, 15, 1)
    }

    if ('streamerRadius' in settings) {
      settings.streamerRadius = app.updates.rescaleSetting(settings.streamerRadius, 25, 100, 5)
    }

    app.storage.setSettings(settings)
  }
})
