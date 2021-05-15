app.screen.graphics = (() => {
  const sliders = []

  let root

  engine.ready(() => {
    root = document.querySelector('.a-graphics')

    app.state.screen.on('enter-graphics', onEnter)
    app.state.screen.on('exit-graphics', onExit)

    root.querySelector('.a-graphics--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    hydrateSliders()
    hydrateToggles()
  })

  function enableFields(isEnabled) {
    const fields = root.querySelector('.a-graphics--onFields')

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
      ['.a-graphics--drawDistance', app.settings.raw.drawDistance, app.settings.setDrawDistance],
      ['.a-graphics--fov', app.settings.raw.graphicsFov, app.settings.setGraphicsFov],
      ['.a-graphics--hudOpacity', app.settings.raw.graphicsHudOpacity, app.settings.setGraphicsHudOpacity],
      ['.a-graphics--motionBlur', app.settings.raw.graphicsMotionBlur, app.settings.setGraphicsMotionBlur],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      sliders.push(component)
    })
  }

  function hydrateToggles() {
    const on = app.component.toggle.hydrate(root.querySelector('.a-graphics--on'), app.settings.raw.graphicsOn)

    on.on('change', () => {
      const value = on.getValue()
      app.settings.setGraphicsOn(value)
      enableFields(value)
    })

    enableFields(on.getValue())

    ;[
      ['.a-graphics--darkModeOn', app.settings.raw.graphicsDarkModeOn, app.settings.setGraphicsDarkModeOn],
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
