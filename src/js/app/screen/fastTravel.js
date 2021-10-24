app.screen.fastTravel = (() => {
  const destinations = [],
    pois = new Set()

  let root,
    table

  app.ready(() => {
    root = document.querySelector('.a-fastTravel')
    table = root.querySelector('.a-fastTravel--table')

    app.state.screen.on('enter-fastTravel', onEnter)
    app.state.screen.on('exit-fastTravel', onExit)
    engine.state.on('reset', onReset)

    Object.entries({
      back: root.querySelector('.a-fastTravel--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)

    prepopulate()
  })

  function addDestination(...args) {
    const destination = app.component.destination.create(...args).attach(table)

    destination.on('click', onDestinationClick.bind(destination))
    destinations.push(destination)

    return destination
  }

  function canFloor() {
    const floor = content.terrain.floor.current()
    const {z} = engine.position.getVector()

    if (engine.utility.between(z, floor, floor + content.const.underwaterTurboMaxVelocity)) {
      return false
    }

    return app.storage.getTreasures().length > 0
      || content.exploration.export().length > 0
  }

  function canSelectDestination() {
    return content.pois.count() > 0
  }

  function canSurface() {
    const {z} = engine.position.getVector().z
    return z < -content.const.underwaterTurboMaxVelocity
  }

  function clear() {
    for (const destination of destinations) {
      destination.destroy()
    }

    destinations.length = 0
    pois.clear()

    prepopulate()
  }

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return app.state.screen.dispatch('back')
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

  function onDestinationClick() {
    app.state.screen.dispatch('select', this.data)
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    updateItems()

    root.querySelector('.a-fastTravel--data').scrollTop = 0

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function onReset() {
    clear()
  }

  function prepopulate() {
    addDestination({
      name: 'Surface',
      type: 'surface',
    }, {
      beforeUpdate: function () {
        const position = engine.position.getVector()

        this.data.x = position.x
        this.data.y = position.y
        this.data.z = -engine.const.zero

        this.setHidden(!canSurface())
      },
    })

    addDestination({
      name: 'Floor',
      type: 'floor',
    }, {
      beforeUpdate: function () {
        const position = engine.position.getVector()

        this.data.x = position.x
        this.data.y = position.y

        // XXX: Beware, this can cause cache issues, e.g. if this is called on reset, then those values persist on import
        this.data.z = content.terrain.floor.current()

        this.setHidden(!canFloor())
      },
    })

    addDestination({
      name: 'Origin',
      type: 'origin',
      x: 0,
      y: 0,
      z: 0,
    }, {})
  }

  function updateItems() {
    for (const destination of destinations) {
      destination.update()
    }

    for (const poi of content.pois.all()) {
      if (pois.has(poi)) {
        continue
      }

      addDestination(poi)
      pois.add(poi)
    }
  }

  return {
    hasOptions: function () {
      return canFloor() || canSelectDestination() || canSurface()
    },
  }
})()
