app.screen.fastTravel = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-fastTravel')

    app.state.screen.on('enter-fastTravel', onEnter)
    app.state.screen.on('exit-fastTravel', onExit)

    Object.entries({
      back: root.querySelector('.a-fastTravel--back'),
      floor: root.querySelector('.a-fastTravel--floor'),
      origin: root.querySelector('.a-fastTravel--origin'),
      surface: root.querySelector('.a-fastTravel--surface'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)
  })

  function canFloor() {
    return app.storage.getTreasures().length > 0
      || content.exploration.export().length > 0
  }

  function canOrigin() {
    const position = engine.position.getVector()
    return position.x || position.y
  }

  function canSurface() {
    return engine.position.getVector().z < 0
  }

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return app.state.screen.dispatch('back')
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)

    root.querySelector('.a-fastTravel--action-floor').hidden = !canFloor()
    root.querySelector('.a-fastTravel--action-origin').hidden = !canOrigin()
    root.querySelector('.a-fastTravel--action-surface').hidden = !canSurface()
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {
    hasOptions: () => canFloor() || canOrigin() || canSurface(),
  }
})()
