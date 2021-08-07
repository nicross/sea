app.updates.register('1.5.0-alpha', () => {
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
      settings.drawDistanceStatic = settings.drawDistance

      settings.drawDistanceDynamic = engine.utility.lerp(10, 75, settings.drawDistance)
      settings.drawDistanceDynamic = Math.round(settings.drawDistanceDynamic / 5) * 5
      settings.drawDistanceDynamic = engine.utility.scale(settings.drawDistanceDynamic, 10, 75, 0, 1)

      delete settings.drawDistance
    }

    app.storage.setSettings(settings)
  }
})
