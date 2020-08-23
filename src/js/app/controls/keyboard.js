'use strict'

app.controls.keyboard = (() => {
  const controls = {
    AltLeft: false,
    AltRight: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Backspace: false,
    ControlLeft: false,
    Enter: false,
    Escape: false,
    KeyA: false,
    KeyC: false,
    KeyD: false,
    KeyE: false,
    KeyF: false,
    KeyQ: false,
    KeyS: false,
    KeyV: false,
    KeyW: false,
    KeyX: false,
    KeyZ: false,
    Numpad4: false,
    Numpad5: false,
    Numpad6: false,
    Numpad7: false,
    Numpad8: false,
    Numpad9: false,
    ShiftLeft: false,
    ShiftRight: false,
    Space: false,
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) {
      return
    }

    if (e.code in controls) {
      controls[e.code] = true
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.code in controls) {
      controls[e.code] = false
    }
  })

  return {
    game: () => {
      const ascend = controls.KeyV || controls.Space,
        descend = controls.ControlLeft || controls.ControlRight || controls.KeyC,
        moveBackward = controls.ArrowDown || controls.KeyS || controls.Numpad5,
        moveForward = controls.ArrowUp || controls.KeyW || controls.Numpad8,
        strafeLeft = controls.KeyA || controls.KeyZ || controls.Numpad4,
        strafeRight = controls.KeyD || controls.KeyX || controls.Numpad6,
        turbo = controls.ShiftLeft || controls.ShiftRight,
        turnLeft = controls.ArrowLeft || controls.KeyQ || controls.Numpad7,
        turnRight = controls.ArrowRight || controls.KeyE || controls.Numpad9

      const state = {}

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
      Object.keys(controls)
        .forEach((key) => controls[key] = false)

      return this
    },
    ui: () => {
      const state = {}

      if (controls.Backspace) {
        state.backspace = true
      }

      if (controls.Enter || controls.NumpadEnter) {
        state.enter = true
      }

      if (controls.Escape) {
        state.escape = true
      }

      if (controls.Space) {
        state.space = true
      }

      if (controls.ArrowDown || controls.KeyS || controls.Numpad5) {
        state.down = true
      }

      if (controls.ArrowLeft || controls.KeyA || controls.Numpad4) {
        state.left = true
      }

      if (controls.ArrowRight || controls.KeyD || controls.Numpad6) {
        state.right = true
      }

      if (controls.ArrowUp || controls.KeyW || controls.Numpad8) {
        state.up = true
      }

      if (controls.AltLeft || controls.AltRight || controls.KeyF) {
        state.scan = true
      }

      if ((controls.ShiftLeft || controls.ShiftRight) && app.settings.computed.toggleTurbo) {
        state.turbo = true
      }

      return state
    },
  }
})()
