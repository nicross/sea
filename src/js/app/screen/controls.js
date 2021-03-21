app.screen.controls = (() => {
  const sliders = []

  let root

  engine.ready(() => {
    root = document.querySelector('.a-controls')

    app.state.screen.on('enter-controls', onEnter)
    app.state.screen.on('exit-controls', onExit)

    root.querySelector('.a-controls--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    hydrateSliders()
    hydrateToggles()
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

    if (ui.left) {
      for (const slider of sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.decrement()
        }
      }
    }

    if (ui.right) {
      for (const slider of sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.increment()
        }
      }
    }
  }

  function hydrateSliders() {
    [
      ['.a-controls--gamepadDeadzone', app.settings.raw.gamepadDeadzone, app.settings.setGamepadDeadzone],
      ['.a-controls--gamepadVibration', app.settings.raw.gamepadVibration, app.settings.setGamepadVibration],
      ['.a-controls--mouseSensitivity', app.settings.raw.mouseSensitivity, app.settings.setMouseSensitivity],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      sliders.push(component)
    })
  }

  function hydrateToggles() {
    [
      ['.a-controls--toggleTurbo', app.settings.raw.toggleTurbo, app.settings.setToggleTurbo],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.toggle.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValue()))
    })
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
    app.settings.save()
  }

  return {}
})()
