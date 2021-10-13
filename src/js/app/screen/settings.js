app.screen.settings = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-settings')

    app.state.screen.on('enter-settings', onEnter)
    app.state.screen.on('exit-settings', onExit)

    Object.entries({
      audio: root.querySelector('.a-settings--audio'),
      back: root.querySelector('.a-settings--back'),
      controls: root.querySelector('.a-settings--controls'),
      gameplay: root.querySelector('.a-settings--gameplay'),
      graphics: root.querySelector('.a-settings--graphics'),
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
    app.utility.focus.setWithin(root)

    const hasTreasures = app.storage.getTreasures().length > 0
      || content.treasure.any().length > 0

    root.querySelector('.a-settings--action-gameplay').hidden = !hasTreasures
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
