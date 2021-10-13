engine.ready(() => {
  engine.loop.start()
  app.activate()

  // XXX: Prevent unexpected audio, e.g. if initialization takes long and pausedVolume is zero
  engine.audio.mixer.master.param.gain.value = engine.const.zeroGain

  // Set a boosted dynamic range
  engine.audio.mixer.master.param.limiter.attack.value = 0.003
  engine.audio.mixer.master.param.limiter.gain.value = 1
  engine.audio.mixer.master.param.limiter.knee.value = 15
  engine.audio.mixer.master.param.limiter.ratio.value = 15
  engine.audio.mixer.master.param.limiter.release.value = 0.125
  engine.audio.mixer.master.param.limiter.threshold.value = -30

  if (!app.isElectron()) {
    window.addEventListener('beforeunload', (e) => {
      if (app.state.game.is('running')) {
        e.preventDefault()
        e.returnValue = 'Quit S.E.A.?'
      }
    })
  }
})
