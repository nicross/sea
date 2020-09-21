app.controls.mouse = (() => {
  let gameScreen

  engine.ready(() => {
    gameScreen = document.querySelector('.a-game')
    gameScreen.addEventListener('click', onClick)

    app.state.screen.on('exit-game', onExitGame)
    app.state.screen.on('enter-game', onEnterGame)
  })

  function exitPointerLock() {
    document.exitPointerLock()
  }

  function isPointerLock() {
    return document.pointerLockElement === gameScreen
  }

  function onClick() {
    if (!isPointerLock()) {
      requestPointerLock()
    }
  }

  function onEnterGame() {
    document.addEventListener('pointerlockchange', onPointerlockchange)

    if (app.isElectron()) {
      if (app.utility.escape.is()) {
        // XXX: Eventually Chrome seems to ignore pointerlock requests if player cancels it 2 times without clicking mouse
        // TODO: Look into better solution
        app.utility.escape.once('up', requestPointerLock)
      } else {
        requestPointerLock()
      }
    }
  }

  function onExitGame() {
    document.removeEventListener('pointerlockchange', onPointerlockchange)

    if (isPointerLock()) {
      exitPointerLock()
    }
  }

  function onPointerlockchange() {
    if (!isPointerLock() && app.isElectron() && app.utility.escape.is()) {
      pause()
    }
  }

  function pause() {
    app.state.screen.dispatch('pause')
  }

  function requestPointerLock() {
    gameScreen.requestPointerLock()
  }

  return {
    game: function () {
      const mouse = engine.input.mouse.get(),
        state = {}

      if (mouse.button[0] && !mouse.button[2]) {
        state.y = 1
      }

      if (mouse.button[2] && !mouse.button[0]) {
        state.y = -1
      }

      if (mouse.button[3] && !mouse.button[4]) {
        state.z = -1
      }

      if (mouse.button[4] && !mouse.button[3]) {
        state.z = 1
      }

      if (mouse.button[1] && !app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      if (mouse.moveX) {
        state.rotate = engine.utility.scale(mouse.moveX, -window.innerWidth, window.innerWidth, 1, -1) * app.settings.computed.mouseSensitivity
      }

      return state
    },
    ui: function () {
      const mouse = engine.input.mouse.get(),
        state = {}

      if (mouse.wheelY < 0) {
        state.scanForward = true
      } else if (mouse.wheelY > 0) {
        state.scanReverse = true
      }

      if (mouse.button[1] && app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      return state
    },
  }
})()
