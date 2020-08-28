app.crashFixer = (() => {
  const context = engine.audio.context()

  const analyzer = context.createAnalyser()
  analyzer.fftSize = 32
  engine.audio.mixer.master.output.connect(analyzer)

  const analyzerTimeData = new Uint8Array(analyzer.frequencyBinCount)

  function fixFilters() {
    engine.props.forEach((prop) => {
      if (prop.troubleshoot) {
        prop.troubleshoot()
      }
    })

    engine.audio.mixer.rebuildFilters()
  }

  function isFubar() {
    return !analyzerTimeData[0] || isNaN(analyzerTimeData[0]) || !isFinite(analyzerTimeData[0])
  }

  return {
    update: function () {
      analyzer.getByteTimeDomainData(analyzerTimeData)

      if (isFubar()) {
        fixFilters()
        console.error('BiquadFilterNode: bad state fix attempted')
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
