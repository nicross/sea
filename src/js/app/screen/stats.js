app.screen.stats = (() => {
  const numberFormat = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  })

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
    updateStats()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStats() {
    const maxDepth = app.stats.maxDepth.get(),
      maxDistance = app.stats.maxDistance.get(),
      treasures = app.storage.getTreasure().length,
      totalDistance = app.stats.totalDistance.get(),
      totalTime = app.stats.totalTime.get()

    root.querySelector('.a-stats--row-maxDepth').hidden = maxDepth == 0
    root.querySelector('.a-stats--row-treasures').hidden = treasures == 0

    root.querySelector('.a-stats--metric-maxDepth').innerHTML = numberFormat.format(maxDepth)
    root.querySelector('.a-stats--metric-maxDistance').innerHTML = numberFormat.format(maxDistance)
    root.querySelector('.a-stats--metric-totalDistance').innerHTML = numberFormat.format(totalDistance)
    root.querySelector('.a-stats--metric-totalTime').innerHTML = app.utility.formatAccessibleTime(totalTime)
    root.querySelector('.a-stats--metric-treasures').innerHTML = numberFormat.format(treasures)
  }

  app.once('activate', () => {
    root = document.querySelector('.a-stats')

    app.state.screen.on('enter-stats', onEnter)
    app.state.screen.on('exit-stats', onExit)

    root.querySelector('.a-stats--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
  })

  return {}
})()
