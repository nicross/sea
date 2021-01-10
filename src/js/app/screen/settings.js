app.screen.settings = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-settings')

    app.state.screen.on('enter-settings', onEnter)
    app.state.screen.on('exit-settings', onExit)

    Object.entries({
      back: root.querySelector('.a-settings--back'),
      controls: root.querySelector('.a-settings--controls'),
      gameplay: root.querySelector('.a-settings--gameplay'),
      graphics: root.querySelector('.a-settings--graphics'),
      mixer: root.querySelector('.a-settings--mixer'),
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

    root.querySelector('.a-settings--action-gameplay').hidden = !app.storage.getTreasures().length
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
