'use strict'

app.controls.gamepad = {
  deadzone: (input, threshold = 0.1875) => {
    const ratio = (Math.abs(input) - threshold) / (1 - threshold),
      sign = input > 0 ? 1 : -1

    return ratio > 0 ? sign * ratio : 0
  },
  game: function () {
    const gamepads = navigator.getGamepads()

    if (!gamepads.length) {
      return {}
    }

    const buttons = {},
      state = {}

    let rotate = 0,
      x = 0,
      y = 0,
      z = 0

    for (let i = 0; i < gamepads.length; i += 1) {
      const gamepad = gamepads[i]

      if (!gamepad) {
        continue
      }

      const hasLeftStick = 0 in gamepad.axes && 1 in gamepad.axes,
        hasRightStick = 2 in gamepad.axes && 3 in gamepad.axes

      if (hasLeftStick && hasRightStick) {
        rotate += this.deadzone(gamepad.axes[2])
        x += this.deadzone(gamepad.axes[0])
        y += this.deadzone(gamepad.axes[1])
      } else if (hasLeftStick) {
        rotate += this.deadzone(gamepad.axes[0])
        y += this.deadzone(gamepad.axes[1])
      }

      gamepad.buttons.forEach((button, i) => {
        buttons[i] |= button.pressed
      })

      if (6 in gamepad.buttons) {
        y -= gamepad.buttons[6].value
      }

      if (7 in gamepad.buttons) {
        y += gamepad.buttons[7].value
      }
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

    if (buttons[5] && !buttons[4]) {
      state.z = 1
    } else if (buttons[4] && !buttons[5]) {
      state.z = -1
    }

    if ((buttons[10] || buttons[11]) && !app.settings.computed.toggleBoost) {
      state.boost = true
    }

    return state
  },
  ui: function () {
    const gamepads = navigator.getGamepads()

    if (!gamepads.length) {
      return {}
    }

    const buttons = {},
      state = {}

    let x = 0,
      y = 0

    for (let i = 0; i < gamepads.length; i += 1) {
      const gamepad = gamepads[i]

      if (!gamepad) {
        continue
      }

      gamepad.buttons.forEach((button, i) => {
        buttons[i] |= button.pressed
      })

      const hasLeftStick = 0 in gamepad.axes && 1 in gamepad.axes

      if (hasLeftStick) {
        x += this.deadzone(gamepad.axes[0])
        y -= this.deadzone(gamepad.axes[1])
      }
    }

    if ((buttons[10] || buttons[11]) && app.settings.computed.toggleBoost) {
      state.boost = true
    }

    if (buttons[1]) {
      state.cancel = true
    }

    if (buttons[0]) {
      state.confirm = true
      state.scan = true
    }

    if (buttons[8]) {
      state.select = true
    }

    if (buttons[9]) {
      state.start = true
    }

    if (buttons[12]) {
      y = 1
    }

    if (buttons[13]) {
      y = -1
    }

    if (buttons[14]) {
      x = -1
    }

    if (buttons[15]) {
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
