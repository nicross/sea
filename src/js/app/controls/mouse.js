app.controls.mouse = (() => {
  const buttons = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  }

  let gameScreen,
    wheel

  function exitPointerLock() {
    document.exitPointerLock()
  }

  function isPointerLock() {
    return document.pointerLockElement === gameScreen
  }

  function onClick(e) {
    e.preventDefault()
    e.stopPropagation()

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

    reset()
  }

  function onMousedown(e) {
    const button = e.button

    e.preventDefault()
    e.stopPropagation()

    if (!isPointerLock()) {
      return
    }

    if (button in buttons) {
      buttons[button] = true
    }
  }

  function onMousemove(e) {
    if (!isPointerLock()) {
      return
    }

    if (content.system.movement.isCatchingAir()) {
      return
    }

    const scaled = engine.utility.scale(e.movementX, -window.innerWidth, window.innerWidth, 1, -1)
    engine.position.turn(scaled * app.settings.computed.mouseSensitivity * Math.PI)

    content.system.audio.engine.setFakeTurn(scaled)
  }

  function onMouseup(e) {
    const button = e.button

    e.preventDefault()
    e.stopPropagation()

    if (button in buttons) {
      buttons[button] = false
    }
  }

  function onPointerlockchange() {
    if (!isPointerLock() && app.isElectron() && app.utility.escape.is()) {
      pause()
    }
  }

  function onWheel(e) {
    if (!isPointerLock()) {
      return
    }

    wheel = engine.utility.sign(-e.deltaY)
  }

  function pause() {
    app.state.screen.dispatch('pause')
  }

  function requestPointerLock() {
    gameScreen.requestPointerLock()
  }

  function reset() {
    for (const button in buttons) {
      buttons[button] = false
    }
  }

  app.once('activate', () => {
    gameScreen = document.querySelector('.a-game')

    gameScreen.addEventListener('click', onClick)
    gameScreen.addEventListener('mousedown', onMousedown)
    gameScreen.addEventListener('mousemove', onMousemove)
    gameScreen.addEventListener('mouseup', onMouseup)
    gameScreen.addEventListener('wheel', onWheel)

    app.state.screen.on('exit-game', onExitGame)
    app.state.screen.on('enter-game', onEnterGame)
  })

  return {
    game: function () {
      const state = {}

      if (buttons[0] && !buttons[2]) {
        state.y = 1
      }

      if (buttons[2] && !buttons[0]) {
        state.y = -1
      }

      if (buttons[3] && !buttons[4]) {
        state.z = -1
      }

      if (buttons[4] && !buttons[3]) {
        state.z = 1
      }

      if (buttons[1] && !app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      return state
    },
    ui: function () {
      const state = {}

      if (wheel > 0) {
        state.scanForward = true
      } else if (wheel < 0) {
        state.scanReverse = true
      }

      if (buttons[1] && app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      wheel = 0

      return state
    },
  }
})()
