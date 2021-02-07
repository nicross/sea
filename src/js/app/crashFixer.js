app.crashFixer = (() => {
  const context = engine.audio.context()

  const analyzer = context.createAnalyser()
  analyzer.fftSize = 32
  engine.audio.mixer.master.output().connect(analyzer)

  const analyzerTimeData = new Uint8Array(analyzer.frequencyBinCount)

  let isFixing = false

  function fix() {
    console.error('BiquadFilterNode: bad state fix attempted')
    isFixing = true

    engine.props.get().forEach((prop) => {
      if (prop.troubleshoot) {
        prop.output.disconnect()
      }
    })

    nextFrame(() => {
      content.system.audio.treasure.rebuildFilters()

      nextFrame(() => {
        engine.props.get().forEach((prop) => {
          if (prop.troubleshoot) {
            prop.troubleshoot()
          }
        })

        nextFrame(() => {
          engine.audio.mixer.rebuildFilters()
          nextFrame(() => isFixing = false)
        })
      })
    })
  }

  function isFubar() {
    return !analyzerTimeData[0] || isNaN(analyzerTimeData[0]) || !isFinite(analyzerTimeData[0])
  }

  function nextFrame(fn) {
    engine.loop.once('frame', fn)
  }

  return {
    force: function () {
      fix()
      return this
    },
    isFixing: () => isFixing,
    isFubar: () => isFubar(),
    test: async function () {
      content.system.treasure.off('collect')

      engine.props.get().forEach((prop) => {
        if (content.prop.treasure.isPrototypeOf(prop)) {
          prop.collect()
        }
      })

      await content.system.scan.triggerForward()

      if (!engine.props.get().filter(p => content.prop.treasure.isPrototypeOf(p)).length) {
        content.system.treasure.test(1)
      }

      return this
    },
    testLoop: function () {
      const loop = () => {
        this.test()

        content.system.scan.once('recharge', () => {
          nextFrame(() => {
            setTimeout(() => {
              if (!isFubar()) {
                loop()
              }
            }, 1000)
          })
        })
      }

      loop()

      return this
    },
    update: function () {
      analyzer.getByteTimeDomainData(analyzerTimeData)

      if (isFubar() && !isFixing) {
        fix()
      }

      return this
    },
  }
})()

engine.loop.on('frame', () => {
  if (app.state.game.is('none')) {
    return
  }

  app.crashFixer.update()
})
