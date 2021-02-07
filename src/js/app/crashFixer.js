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

    engine.loop.once('frame', () => {
      content.system.audio.treasure.rebuildFilters()

      engine.props.get().forEach((prop) => {
        if (prop.troubleshoot) {
          prop.troubleshoot()
        }
      })

      engine.audio.mixer.rebuildFilters()

      isFixing = false
    })
  }

  function isFubar() {
    return !analyzerTimeData[0] || isNaN(analyzerTimeData[0]) || !isFinite(analyzerTimeData[0])
  }

  return {
    force: function () {
      fix()
      return this
    },
    isFixing: () => isFixing,
    isFubar: () => isFubar(),
    test: async function (vector) {
      content.system.treasure.off('collect')

      if (vector) {
        vector = engine.utility.vector3d.create(vector)
          .rotateQuaternion(engine.position.getQuaternion())
          .add(engine.position.getVector())
      }

      engine.props.get().forEach((prop) => {
        if (content.prop.treasure.isPrototypeOf(prop)) {
          prop.collect()
        }
      })

      await content.system.scan.triggerForward()

      if (!engine.props.get().filter(p => content.prop.treasure.isPrototypeOf(p)).length) {
        content.system.treasure.test(1, vector)
      }

      return this
    },
    testLoop: function () {
      const loop = () => {
        this.test()

        content.system.scan.once('recharge', () => {
          requestAnimationFrame(() => {
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

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  app.crashFixer.update()
})
