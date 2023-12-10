app.screen.peripherySynthetic = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-peripherySynthetic')

    app.state.screen.on('enter-peripherySynthetic', onEnter)
    app.state.screen.on('exit-peripherySynthetic', onExit)

    Object.entries({
      acknowledge: root.querySelector('.a-peripherySynthetic--acknowledge'),
      dismiss: root.querySelector('.a-peripherySynthetic--dismiss'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)
  })

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ((ui.confirm || ui.enter || ui.space || ui.start) && !app.utility.focus.get(root)) {
      return app.state.screen.dispatch('dismiss')
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
    app.utility.focus.set(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
