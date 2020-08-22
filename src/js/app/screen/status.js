app.screen.status = (() => {
  let root

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
    updateStatus()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStatus() {
    const depth = Math.max(0, -content.system.z.get()),
      position = engine.position.get(),
      treasures = content.system.treasure.getTotalCollected(),
      time = content.system.time.get()

    root.querySelector('.a-status--row-depth').hidden = !depth
    root.querySelector('.a-status--row-treasures').hidden = !treasures

    root.querySelector('.a-status--metric-coordinates').innerHTML = app.utility.format.coordinates(position)
    root.querySelector('.a-status--metric-depth').innerHTML = app.utility.format.number(depth)
    root.querySelector('.a-status--metric-heading').innerHTML = app.utility.format.angle(position.angle)
    root.querySelector('.a-status--metric-time').innerHTML = app.utility.format.time(time)
    root.querySelector('.a-status--metric-treasures').innerHTML = app.utility.format.number(treasures)
  }

  app.once('activate', () => {
    root = document.querySelector('.a-status')

    app.state.screen.on('enter-status', onEnter)
    app.state.screen.on('exit-status', onExit)

    root.querySelector('.a-status--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
  })

  return {}
})()
