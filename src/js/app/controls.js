app.controls = (() => {
  const gameDefaults = {
    rotate: 0,
    x: 0,
    y: 0,
    z: 0,
  }

  let uiCache = {},
    uiDelta = {}

  let gameCache = {...gameDefaults}

  return {
    game: () => ({...gameCache}),
    ui: () => ({...uiDelta}),
    update: function () {
      return this.updateGame().updateUi()
    },
    updateGame: function () {
      gameCache = {
        ...gameDefaults,
        ...this.gamepad.game(),
        ...this.keyboard.game(),
        ...this.mouse.game(),
      }

      return this
    },
    updateUi: function () {
      const values = {
        ...this.gamepad.ui(),
        ...this.keyboard.ui(),
        ...this.mouse.ui(),
      }

      uiDelta = {}

      for (const key in values) {
        if (!(key in uiCache)) {
          uiDelta[key] = values[key]
        }
      }

      uiCache = values

      return this
    },
  }
})()

engine.loop.on('frame', () => app.controls.update())
