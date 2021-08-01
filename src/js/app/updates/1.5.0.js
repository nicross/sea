app.updates.register('1.5.0-alpha', () => {
  updateGame()

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
})
