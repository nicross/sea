app.screen.misc = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-misc')

    app.state.screen.on('enter-misc', onEnter)
    app.state.screen.on('exit-misc', onExit)

    Object.entries({
      back: root.querySelector('.a-misc--back'),
      gallery: root.querySelector('.a-misc--gallery'),
      settings: root.querySelector('.a-misc--settings'),
      stats: root.querySelector('.a-misc--stats'),
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
    engine.loop.on('frame', onEngineLoopFrame)
    root.querySelector('.a-misc--action-gallery').hidden = !app.storage.hasTreasures()
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
