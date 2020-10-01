app.updates.register('1.1.0', () => {
  updateGame()
  updateSettings()

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    game.position = {
      quaternion: engine.utility.quaternion.fromEuler({
        yaw: game.position.angle,
      }),
      x: game.position.x,
      y: game.position.y,
      z: game.z,
    }

    delete game.z

    app.storage.setGame(game)
  }

  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    if (settings.masterVolume) {
      settings.mainVolume = settings.masterVolume
    }

    delete settings.masterVolume

    app.storage.setSettings(settings)
  }
})
