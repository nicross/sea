app.theme = (() => {
  const customProperties = {},
    root = document.documentElement

  let interval

  app.ready(() => {
    app.state.screen.on('before-game-pause', update)
    engine.loop.on('frame', onFrame)
  })

  function onFrame({delta}) {
    if (interval > delta) {
      interval -= delta
      return
    }

    interval = 1/4

    if (app.state.screen.is('game')) {
      return
    }

    update()
  }

  function setCustomProperty(name, value) {
    if (customProperties[name] == value) {
      return
    }

    root.style.setProperty(`--${name}`, value)
    customProperties[name] = value
  }

  function setColorCycle() {
    const clock = content.time.clock(),
      cycle = content.utility.smooth(engine.utility.wrapAlternate(clock * 2, 0, 1), 25) ** (1/3),
      hueValue = content.utility.smooth(Math.abs(Math.cos(Math.PI * 2 * clock)) ** 0.5, 25)

    const color = {
      h: engine.utility.lerp(330/360, 240/360, hueValue),
      s: engine.utility.lerp(1/3, 1, cycle),
      l: engine.utility.lerp(0.5, 0.75, cycle),
    }

    setCustomProperty('color-cycle', app.utility.color.toHslaString({...color, a: 1}))
    setCustomProperty('color-cycle-half', app.utility.color.toHslaString({...color, a: 0.5}))
  }

  function update() {
    setColorCycle()
  }

  return {
    update: function () {
      update()

      return this
    },
  }
})()
