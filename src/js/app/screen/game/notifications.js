// TODO: Create a more modular system for notification types (when more are added)

app.screen.game.notifications = (() => {
  const queue = []

  let isActive = false,
    root,
    timeout = 0

  app.ready(() => {
    root = document.querySelector('.a-game--notifications')

    engine.state.on('reset', onEngineStateReset)

    app.state.screen.on('enter-game', onEnterGame)
    app.state.screen.on('exit-game', onExitGame)

    content.pois.on('worm', onPoisWorm)
    content.treasure.on('collect', onTreasureCollect)
  })

  function onEnterGame() {
    isActive = app.settings.raw.notifyPoi || app.settings.raw.notifyTreasure

    if (!isActive) {
      return
    }

    engine.loop.on('frame', onFrame)
    root.setAttribute('aria-live', 'polite')
  }

  function onExitGame() {
    if (!isActive) {
      return
    }

    engine.loop.off('frame', onFrame)
    root.removeAttribute('aria-live')
  }

  function onFrame({delta, paused}) {
    if (paused) {
      return
    }

    if (timeout > 0) {
      timeout -= delta
      return
    }

    for (const child of root.children) {
      if (!child.hasAttribute('aria-hidden')) {
        child.setAttribute('aria-hidden', 'true')
        child.setAttribute('role', 'presentation')
        child.onanimationend = () => child.remove()
      }
    }

    if (!queue.length) {
      return
    }

    root.appendChild(queue.shift())
    timeout = app.const.notificationTimeout
  }

  function onEngineStateReset() {
    queue.length = 0
    root.innerHTML = ''
  }

  function onPoisWorm(poi) {
    if (!app.settings.raw.notifyPoi) {
      return
    }

    queue.push(
      app.utility.dom.toElement(
        `<aside class="a-game--notification c-notification c-notification-treasure"><h1 class="c-notification--title">Cave Discovered</h1><p class="c-notification--body">${poi.name}</p></aside>`
      )
    )
  }

  function onTreasureCollect(treasure) {
    if (!app.settings.raw.notifyTreasure) {
      return
    }

    queue.push(
      app.utility.dom.toElement(
        `<aside class="a-game--notification c-notification c-notification-treasure"><h1 class="c-notification--title">Treasure Collected</h1><p class="c-notification--body">${treasure.name}</p><div class="c-notification--extra"><span aria-hidden="true" role="presentation">Value:</span> ${app.utility.format.number(app.utility.treasure.computeValue(treasure))} <abbr aria-label="gold">g</abbr></div></aside>`
      )
    )
  }

  return {
    testTreasure: () => onTreasureCollect({
      ...content.treasures.generate(),
      ...engine.position.getVector(),
    }),
  }
})()
