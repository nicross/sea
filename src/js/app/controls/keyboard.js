app.controls.keyboard = {
  game: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    const ascend = keys.Space,
      descend = keys.ControlLeft || keys.ControlRight || keys.KeyC,
      moveBackward = keys.ArrowDown || keys.KeyS || keys.Numpad5,
      moveForward = keys.ArrowUp || keys.KeyW || keys.Numpad8,
      strafeLeft = keys.KeyA || keys.KeyZ || keys.Numpad4,
      strafeRight = keys.KeyD || keys.KeyX || keys.Numpad6,
      turbo = keys.ShiftLeft || keys.ShiftRight,
      turnLeft = keys.ArrowLeft || keys.KeyQ || keys.Numpad7,
      turnRight = keys.ArrowRight || keys.KeyE || keys.Numpad9

    if (moveBackward && !moveForward) {
      state.y = -1
    } else if (moveForward && !moveBackward) {
      state.y = 1
    }

    if (strafeLeft && !strafeRight) {
      state.x = -1
    } else if (strafeRight && !strafeLeft) {
      state.x = 1
    }

    if (turnLeft && !turnRight) {
      state.rotate = 1
    } else if (turnRight && !turnLeft) {
      state.rotate = -1
    }

    if (ascend && !descend) {
      state.z = 1
    }

    if (descend && !ascend) {
      state.z = -1
    }

    if (turbo && !app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    return state
  },
  reset: function () {
    Object.keys(keys)
      .forEach((key) => keys[key] = false)

    return this
  },
  ui: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    if (keys.Backspace) {
      state.backspace = true
    }

    if (keys.Enter || keys.NumpadEnter) {
      state.enter = true
    }

    if (keys.Escape) {
      state.escape = true
    }

    if (keys.Space) {
      state.space = true
    }

    if (keys.ArrowDown || keys.KeyS || keys.Numpad5) {
      state.down = true
    }

    if (keys.ArrowLeft || keys.KeyA || keys.Numpad4) {
      state.left = true
    }

    if (keys.ArrowRight || keys.KeyD || keys.Numpad6) {
      state.right = true
    }

    if (keys.ArrowUp || keys.KeyW || keys.Numpad8) {
      state.up = true
    }

    if (keys.KeyF) {
      state.scanForward = true
    }

    if (keys.KeyR || keys.KeyV) {
      state.scanReverse = true
    }

    if ((keys.ShiftLeft || keys.ShiftRight) && app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    return state
  },
}
