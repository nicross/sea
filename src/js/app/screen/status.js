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
    updateStatus()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStatus() {
    const {x, y, z} = engine.position.getVector()

    const clock = content.time.clock(),
      coordinates = {x, y},
      treasures = content.treasure.getCollected(),
      time = content.time.time(),
      velocity = engine.position.getVelocity(),
      yaw = engine.position.getEuler().yaw

    const earnings = treasures.reduce((sum, treasure) => sum + app.utility.treasure.computeValue(treasure), 0),
      treasuresCollected = treasures.length

    const lastTreasure = treasuresCollected
      ? treasures[treasuresCollected - 1].name
      : ''

    root.querySelector('.a-status--row-earnings').hidden = !treasuresCollected
    root.querySelector('.a-status--row-lastTreasure').hidden = !treasuresCollected
    root.querySelector('.a-status--row-treasures').hidden = !treasuresCollected

    root.querySelector('.a-status--metric-clock').innerHTML = app.utility.format.clock(clock)
    root.querySelector('.a-status--metric-coordinates').innerHTML = app.utility.format.coordinates(coordinates)
    root.querySelector('.a-status--metric-earnings').innerHTML = app.utility.format.number(earnings)
    root.querySelector('.a-status--metric-heading').innerHTML = app.utility.format.angle(yaw)
    root.querySelector('.a-status--metric-lastTreasure').innerHTML = lastTreasure
    root.querySelector('.a-status--metric-time').innerHTML = app.utility.format.time(time)
    root.querySelector('.a-status--metric-treasures').innerHTML = app.utility.format.number(treasuresCollected)
    root.querySelector('.a-status--metric-velocity').innerHTML = app.utility.format.velocity(velocity)

    root.querySelector('.a-status--label-z').innerHTML = z >= 0 ? 'Altitude' : 'Depth'
    root.querySelector('.a-status--metric-z').innerHTML = app.utility.format.number(Math.abs(z))
  }

  return {}
})()
