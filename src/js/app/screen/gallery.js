app.screen.gallery = (() => {
  const uuids = new Set()

  let root,
    table

  app.ready(() => {
    root = document.querySelector('.a-gallery')
    table = root.querySelector('.a-gallery--table')

    app.state.screen.on('enter-gallery', onEnter)
    app.state.screen.on('exit-gallery', onExit)

    root.querySelector('.a-gallery--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.c-screen--scrollable'))
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

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    updateItems()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateItems() {
    const treasures = app.storage.getTreasures().reverse()

    for (const treasure of treasures) {
      if (uuids.has(treasure.uuid)) {
        continue
      }

      app.component.treasure.create(treasure).attach(table)
      uuids.add(treasure.uuid)
    }
  }

  return {}
})()
