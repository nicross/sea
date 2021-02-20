app.screen.status = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-status')

    app.state.screen.on('enter-status', onEnter)
    app.state.screen.on('exit-status', onExit)

    root.querySelector('.a-status--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.a-status--data'))
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
    const {x, y, z} = engine.position.getVector()

    const coordinates = {x, y},
      depth = Math.max(0, -z),
      treasures = content.system.treasure.getCollected(),
      time = content.system.time.time(),
      yaw = engine.position.getEuler().yaw

    const earnings = treasures.reduce((sum, treasure) => sum + app.utility.treasure.computeValue(treasure), 0),
      treasuresCollected = treasures.length

    const lastTreasure = treasuresCollected
      ? treasures[treasuresCollected - 1].name
      : ''

    root.querySelector('.a-status--row-depth').hidden = !depth
    root.querySelector('.a-status--row-earnings').hidden = !treasuresCollected
    root.querySelector('.a-status--row-lastTreasure').hidden = !treasuresCollected
    root.querySelector('.a-status--row-treasures').hidden = !treasuresCollected

    root.querySelector('.a-status--metric-coordinates').innerHTML = app.utility.format.coordinates(coordinates)
    root.querySelector('.a-status--metric-depth').innerHTML = app.utility.format.number(depth)
    root.querySelector('.a-status--metric-earnings').innerHTML = app.utility.format.number(earnings)
    root.querySelector('.a-status--metric-heading').innerHTML = app.utility.format.angle(yaw)
    root.querySelector('.a-status--metric-lastTreasure').innerHTML = lastTreasure
    root.querySelector('.a-status--metric-time').innerHTML = app.utility.format.time(time)
    root.querySelector('.a-status--metric-treasures').innerHTML = app.utility.format.number(treasuresCollected)
  }

  return {}
})()
