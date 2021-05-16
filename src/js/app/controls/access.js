app.controls.access = () => {
  const keys = engine.input.keyboard.get()

  if (!keys.AltLeft && !keys.AltRight) {
    return false
  }

  if (keys.Digit1 || keys.KeyT) {
    return 'time'
  }

  if (keys.Digit2 || keys.KeyH) {
    return 'heading'
  }

  if (keys.Digit3 || keys.KeyC) {
    return 'coordinates'
  }

  if (keys.Digit4 || keys.KeyZ) {
    return 'z'
  }

  if (keys.KeyX) {
    return 'x'
  }

  if (keys.KeyY) {
    return 'y'
  }

  return true
}
