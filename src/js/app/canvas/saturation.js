app.canvas.saturation = (() => {
  const main = app.canvas

  let current = 1,
    tween

  app.ready(() => {
    content.scan.on('complete', onScanComplete)
    content.scan.on('trigger', onScanTrigger)
    engine.state.on('reset', onReset)
  })

  function onReset() {
    current = 1
    tween = null

    main.canvas().style.filter = ''
  }

  function onScanComplete() {
    if (current == 1) {
      return
    }

    const now = performance.now()

    tween = {
      start: now + (content.const.scanCooldown/2 * 1000),
      end: now + (content.const.scanCooldown * 1000),
      from: current,
      to: 1,
      exponent: 2,
    }
  }

  function onScanTrigger() {
    if (current == 0) {
      return
    }

    const now = performance.now()

    tween = {
      start: now,
      end: now + (content.const.scanMinimum * 1000),
      from: current,
      to: 0,
      exponent: 0.5,
    }
  }

  return {
    reset: function () {
      onReset()
      return this
    },
    update: function () {
      if (!tween) {
        return this
      }

      if (current == tween.to) {
        tween = null
        return this
      }

      const now = performance.now()
      let value

      if (now <= tween.start) {
        value = tween.from
      } else if (now >= tween.end) {
        value = tween.to
      } else {
        value = engine.utility.scale(now, tween.start, tween.end, tween.from, tween.to) ** tween.exponent
      }

      main.canvas().style.filter = `grayscale(${(1 - value) * 100}%)`
      current = value

      return this
    },
  }
})()
