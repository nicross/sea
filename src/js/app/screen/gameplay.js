app.screen.gameplay = (() => {
  const sliders = []

  let root

  engine.ready(() => {
    root = document.querySelector('.a-gameplay')

    app.state.screen.on('enter-gameplay', onEnter)
    app.state.screen.on('exit-gameplay', onExit)

    root.querySelector('.a-gameplay--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    hydrateToggles()
  })

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return onBackClick()
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

  function hydrateToggles() {
    [
      ['.a-gameplay--notifyTreasure', app.settings.raw.notifyTreasure, app.settings.setNotifyTreasure],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.toggle.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValue()))
    })
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)

    root.querySelector('.a-gameplay--field-notifyTreasure').hidden = !app.storage.getTreasures().length
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
    app.settings.save()
  }

  return {}
})()
