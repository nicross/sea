app.screen.graphics = (() => {
  const sliders = []

  let darkModeOnFields,
    onFields,
    root

  engine.ready(() => {
    root = document.querySelector('.a-graphics')
    darkModeOnFields = root.querySelector('.a-graphics--darkModeOnFields')
    onFields = root.querySelector('.a-graphics--onFields')

    app.state.screen.on('enter-graphics', onEnter)
    app.state.screen.on('exit-graphics', onExit)

    root.querySelector('.a-graphics--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    hydrateSliders()
    hydrateToggles()
  })

  function enableFields(fields, isEnabled) {
    if (isEnabled) {
      fields.removeAttribute('aria-hidden', 'hidden')
      fields.removeAttribute('role', 'presentation')
    } else {
      fields.setAttribute('aria-hidden', 'hidden')
      fields.setAttribute('role', 'presentation')
    }

    [...fields.querySelectorAll('input')].forEach((field) => {
      if (isEnabled) {
        field.removeAttribute('disabled')
      } else {
        field.setAttribute('disabled', '')
      }
    })
  }

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
      ['.a-graphics--backlightStrength', app.settings.raw.graphicsBacklightStrength, app.settings.setGraphicsBacklightStrength],
      ['.a-graphics--drawDistanceDynamic', app.settings.raw.drawDistanceDynamic, app.settings.setDrawDistanceDynamic],
      ['.a-graphics--drawDistanceStatic', app.settings.raw.drawDistanceStatic, app.settings.setDrawDistanceStatic],
      ['.a-graphics--fov', app.settings.raw.graphicsFov, app.settings.setGraphicsFov],
      ['.a-graphics--hudOpacity', app.settings.raw.graphicsHudOpacity, app.settings.setGraphicsHudOpacity],
      ['.a-graphics--tracers', app.settings.raw.graphicsTracers, app.settings.setGraphicsTracers],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      sliders.push(component)
    })
  }

  function hydrateToggles() {
    const darkModeOn = app.component.toggle.hydrate(root.querySelector('.a-graphics--darkModeOn'), app.settings.raw.graphicsDarkModeOn)

    darkModeOn.on('change', () => {
      const value = darkModeOn.getValue()
      app.settings.setGraphicsDarkModeOn(value)
      enableFields(darkModeOnFields, value)
    })

    enableFields(darkModeOnFields, darkModeOn.getValue())

    const on = app.component.toggle.hydrate(root.querySelector('.a-graphics--on'), app.settings.raw.graphicsOn)

    on.on('change', () => {
      const value = on.getValue()
      app.settings.setGraphicsOn(value)
      enableFields(onFields, value)
    })

    enableFields(onFields, on.getValue())
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
