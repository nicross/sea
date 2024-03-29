app.updates.register('1.5.0', () => {
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
      settings.drawDistanceDynamic = app.updates.rescaleSetting(settings.drawDistance, 10, 75, 5)
      settings.drawDistanceStatic = app.updates.rescaleSetting(settings.drawDistance, 50, 1000, 25)
      delete settings.drawDistance
    }

    if ('streamerLimit' in settings) {
      settings.streamerLimit = app.updates.rescaleSetting(settings.streamerLimit, 5, 15, 1)
    }

    if ('streamerRadius' in settings) {
      settings.streamerRadius = app.updates.rescaleSetting(settings.streamerRadius, 25, 100, 5)
    }

    if ('treasureHints' in settings) {
      settings.graphicsHudTreasureOn = settings.treasureHints
      delete settings.treasureHints
    }

    app.storage.setSettings(settings)
  }
})
