app.updates.register('1.3.0', () => {
  updateGame()

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
})
