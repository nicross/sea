app.screen.stats = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-stats')

    app.state.screen.on('enter-stats', onEnter)
    app.state.screen.on('exit-stats', onExit)

    root.querySelector('.a-stats--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.a-stats--data'))
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
      treasures = app.storage.getTreasures(),
      totalDistance = app.stats.totalDistance.get(),
      totalTime = app.stats.totalTime.get()

    const galleryValue = treasures.reduce((sum, treasure) => sum + app.utility.treasure.computeValue(treasure), 0),
      treasuresCollected = treasures.length

    root.querySelector('.a-stats--row-gallery').hidden = !treasuresCollected
    root.querySelector('.a-stats--row-maxDepth').hidden = !maxDepth
    root.querySelector('.a-stats--row-treasures').hidden = !treasuresCollected

    root.querySelector('.a-stats--metric-gallery').innerHTML = app.utility.format.number(galleryValue)
    root.querySelector('.a-stats--metric-maxDepth').innerHTML = app.utility.format.number(maxDepth)
    root.querySelector('.a-stats--metric-maxDepth').innerHTML = app.utility.format.number(maxDepth)
    root.querySelector('.a-stats--metric-maxDistance').innerHTML = app.utility.format.number(maxDistance)
    root.querySelector('.a-stats--metric-totalDistance').innerHTML = app.utility.format.number(totalDistance)
    root.querySelector('.a-stats--metric-totalTime').innerHTML = app.utility.format.time(totalTime)
    root.querySelector('.a-stats--metric-treasures').innerHTML = app.utility.format.number(treasuresCollected)
  }

  return {}
})()
