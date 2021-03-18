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
    updateStats()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStats() {
    const fastTravels = app.stats.fastTravels.get(),
      maxDepth = app.stats.maxDepth.get(),
      maxDistance = app.stats.maxDistance.get(),
      scanResults = app.stats.scanResults.get(),
      scans = app.stats.scans.get(),
      timeAir = app.stats.timeAir.get(),
      timeCaving = app.stats.timeCaving.get(),
      timeIdle = app.stats.timeIdle.get(),
      timeSurface = app.stats.timeSurface.get(),
      timeUnderwater = app.stats.timeUnderwater.get(),
      treasures = app.storage.getTreasures(),
      totalDistance = app.stats.totalDistance.get(),
      totalTime = app.stats.totalTime.get()

    const galleryValue = treasures.reduce((sum, treasure) => sum + app.utility.treasure.computeValue(treasure), 0),
      treasuresCollected = treasures.length

    root.querySelector('.a-stats--row-gallery').hidden = !treasuresCollected
    root.querySelector('.a-stats--row-fastTravels').hidden = !fastTravels
    root.querySelector('.a-stats--row-scanResults').hidden = !scanResults
    root.querySelector('.a-stats--row-scans').hidden = !scans
    root.querySelector('.a-stats--row-maxDepth').hidden = !maxDepth
    root.querySelector('.a-stats--row-treasures').hidden = !treasuresCollected
    root.querySelector('.a-stats--row-timeAir').hidden = !timeAir
    root.querySelector('.a-stats--row-timeCaving').hidden = !timeCaving
    root.querySelector('.a-stats--row-timeIdle').hidden = !timeIdle
    root.querySelector('.a-stats--row-timeSurface').hidden = !timeAir && !timeCaving && !timeUnderwater
    root.querySelector('.a-stats--row-timeUnderwater').hidden = !timeUnderwater

    root.querySelector('.a-stats--metric-gallery').innerHTML = app.utility.format.number(galleryValue)
    root.querySelector('.a-stats--metric-fastTravels').innerHTML = app.utility.format.number(fastTravels)
    root.querySelector('.a-stats--metric-maxDepth').innerHTML = app.utility.format.number(maxDepth)
    root.querySelector('.a-stats--metric-maxDepth').innerHTML = app.utility.format.number(maxDepth)
    root.querySelector('.a-stats--metric-maxDistance').innerHTML = app.utility.format.number(maxDistance)
    root.querySelector('.a-stats--metric-scanResults').innerHTML = app.utility.format.number(scanResults)
    root.querySelector('.a-stats--metric-scans').innerHTML = app.utility.format.number(scans)
    root.querySelector('.a-stats--metric-timeAir').innerHTML = app.utility.format.time(timeAir)
    root.querySelector('.a-stats--metric-timeCaving').innerHTML = app.utility.format.time(timeCaving)
    root.querySelector('.a-stats--metric-timeIdle').innerHTML = app.utility.format.time(timeIdle)
    root.querySelector('.a-stats--metric-timeSurface').innerHTML = app.utility.format.time(timeSurface)
    root.querySelector('.a-stats--metric-timeUnderwater').innerHTML = app.utility.format.time(timeUnderwater)
    root.querySelector('.a-stats--metric-totalDistance').innerHTML = app.utility.format.number(totalDistance)
    root.querySelector('.a-stats--metric-totalTime').innerHTML = app.utility.format.time(totalTime)
    root.querySelector('.a-stats--metric-treasures').innerHTML = app.utility.format.number(treasuresCollected)
  }

  return {}
})()
