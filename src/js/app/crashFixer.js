app.crashFixer = (() => {
  const context = engine.audio.context()

  const analyzer = context.createAnalyser()
  analyzer.fftSize = 32
  engine.audio.mixer.master.output().connect(analyzer)

  const analyzerTimeData = new Uint8Array(analyzer.frequencyBinCount)

  let isFixing = false

  async function fix() {
    console.error('BiquadFilterNode: bad state fix attempted', performance.now())
    isFixing = true

    engine.props.get().forEach((prop) => {
      if (prop.troubleshoot) {
        prop.output.disconnect()
      }
    })
    await nextFrame()

    content.system.audio.treasure.rebuildFilters()
    await nextFrame()

    engine.props.get().forEach((prop) => {
      if (prop.troubleshoot) {
        prop.troubleshoot()
      }
    })
    await nextFrame()

    engine.audio.mixer.rebuildFilters()
    await nextFrame()

    isFixing = false
  }

  function isFubar() {
    return !analyzerTimeData[0] || isNaN(analyzerTimeData[0]) || !isFinite(analyzerTimeData[0])
  }

  function nextFrame() {
    return new Promise((resolve) => {
      engine.loop.once('frame', resolve)
    })
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
      await nextFrame()

      if (!engine.props.get().filter(p => content.prop.treasure.isPrototypeOf(p)).length) {
        content.system.treasure.test(1)
      }

      return this
    },
    testLoop: function () {
      const loop = () => {
        this.test()

        content.system.scan.once('recharge', async () => {
          await nextFrame()
          setTimeout(() => {
            if (!isFubar()) {
              loop()
            }
          }, 1000)
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
