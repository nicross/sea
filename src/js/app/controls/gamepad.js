app.controls.gamepad = {
  game: function () {
    const {digital} = engine.input.gamepad.get()
    const state = {}

    let rotate = 0,
      x = 0,
      y = 0,
      z = 0

    if (engine.input.gamepad.hasAxis(0, 1, 2)) {
      rotate += engine.input.gamepad.getAxis(2, true)
      x += engine.input.gamepad.getAxis(0)
      y += engine.input.gamepad.getAxis(1, true)
    } else if (engine.input.gamepad.hasAxis(0, 1)) {
      rotate += engine.input.gamepad.getAxis(0, true)
      y += engine.input.gamepad.getAxis(1, true)
    }

    y -= engine.input.gamepad.getAnalog(6)
    y += engine.input.gamepad.getAnalog(7)

    if (digital[12]) {
      y = 1
    }

    if (digital[13]) {
      y = -1
    }

    if (digital[14]) {
      rotate = 1
    }

    if (digital[15]) {
      rotate = -1
    }

    rotate = engine.utility.clamp(rotate, -1, 1) || 0
    x = engine.utility.clamp(x, -1, 1) || 0
    y = engine.utility.clamp(y, -1, 1) || 0
    z = engine.utility.clamp(z, -1, 1) || 0

    if (rotate) {
      state.rotate = rotate
    }

    if (x) {
      state.x = x
    }

    if (y) {
      state.y = y
    }

    const isAscend = digital[3] || digital[5],
      isDescend = digital[2] || digital[4],
      isTurbo = digital[10] || digital[11]

    if (isAscend && !isDescend) {
      state.z = 1
    } else if (isDescend && !isAscend) {
      state.z = -1
    }

    if (isTurbo && !app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    return state
  },
  ui: function () {
    const {digital} = engine.input.gamepad.get()
    const state = {}

    let x = 0,
      y = 0

    if (engine.input.gamepad.hasAxis(0, 1)) {
      x += engine.input.gamepad.getAxis(0)
      y += engine.input.gamepad.getAxis(1, true)
    }

    if ((digital[10] || digital[11]) && app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    if (digital[1] || digital[8]) {
      state.cancel = true
    }

    if (digital[0] || digital[9]) {
      state.confirm = true
    }

    if (digital[0]) {
      state.scanForward = true
    }

    if (digital[1]) {
      state.scanReverse = true
    }

    if (digital[8]) {
      state.select = true
    }

    if (digital[9]) {
      state.start = true
    }

    if (digital[12]) {
      y = 1
    }

    if (digital[13]) {
      y = -1
    }

    if (digital[14]) {
      x = -1
    }

    if (digital[15]) {
      x = 1
    }

    const absX = Math.abs(x),
      absY = Math.abs(y)

    if (absX - absY >= 0.125) {
      if (x < 0) {
        state.left = true
      } else {
        state.right = true
      }
    } else if (absY - absX >= 0.125) {
      if (y < 0) {
        state.down = true
      } else {
        state.up = true
      }
    }

    return state
  },
}
