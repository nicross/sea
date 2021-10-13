app.screen.newGame = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-newGame')

    app.state.screen.on('enter-newGame', onEnter)
    app.state.screen.on('exit-newGame', onExit)

    Object.entries({
      back: root.querySelector('.a-newGame--back'),
      new: root.querySelector('.a-newGame--new'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)
  })

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
    // XXX: Skip screen if no game to overwrite
    if (!app.storage.hasGame()) {
      window.requestAnimationFrame(() => {
        app.state.screen.dispatch('new')
      })

      return
    }

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.set(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
