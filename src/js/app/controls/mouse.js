app.controls.mouse = (() => {
  let gameScreen,
    rotate = 0

  // XXX: syngen hack
  let previousMoveX = 0,
    previousWheelY = 0

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

    rotate = 0

    // XXX: syngen hack
    engine.input.mouse.reset()
    previousMoveX = 0
    previousWheelY = 0
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
      if (!isPointerLock()) {
        return {}
      }

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
        // XXX: syngen hack
        const deltaMoveX = mouse.moveX - previousMoveX
        previousMoveX = mouse.moveX

        // Accelerate and clamp rotation
        rotate += engine.utility.scale(deltaMoveX, -window.innerWidth, window.innerWidth, 1, -1) * app.settings.computed.mouseSensitivity
        rotate = engine.utility.clamp(rotate, -1, 1)
      }

      if (rotate) {
        // Apply and decelerate rotation to zero
        state.rotate = rotate
        rotate = content.utility.accelerate.value(rotate, 0, 32)
      }

      return state
    },
    ui: function () {
      const mouse = engine.input.mouse.get(),
        state = {}

      // XXX: syngen hack
      const deltaWheelY = mouse.wheelY - previousWheelY
      previousWheelY = mouse.wheelY

      if (deltaWheelY < 0) {
        state.scanForward = true
      } else if (deltaWheelY > 0) {
        state.scanReverse = true
      }

      if (mouse.button[1] && app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      return state
    },
  }
})()

// XXX: Hack to prevent race condition with setTimeout() call within syngen.input.mouse.update()
// TODO: Fix in syngen
engine.input.mouse.update = () => {}
