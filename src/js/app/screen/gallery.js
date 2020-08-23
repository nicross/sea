app.screen.gallery = (() => {
  const uuids = new Set()

  let items,
    root

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
    const treasures = app.storage.getTreasures()

    for (const treasure of treasures) {
      if (uuids.has(treasure.uuid)) {
        continue
      }

      const li = document.createElement('li')

      li.classList.add('a-gallery--item')
      app.component.treasure.create(treasure).attach(li)
      items.appendChild(li)

      uuids.add(treasure.uuid)
    }
  }

  app.once('activate', () => {
    root = document.querySelector('.a-gallery')
    items = root.querySelector('.a-gallery--items')

    app.state.screen.on('enter-gallery', onEnter)
    app.state.screen.on('exit-gallery', onExit)

    root.querySelector('.a-gallery--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
  })

  return {}
})()
