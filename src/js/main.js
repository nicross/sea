engine.ready(() => {
  engine.loop.start()
  app.activate()

  if (app.storage.hasGame()) {
    const game = app.storage.getGame()

    if (game.position.z >= 0) {
      game.position.z = content.const.waveHeightMax / 2
    }

    engine.state.import(game)
  } else {
    engine.state.import({
      position: {
        quaternion: engine.utility.quaternion.fromEuler({yaw: Math.PI / 8}),
        z: content.const.waveHeightMax / 2,
      },
      time: {
        offset: (content.const.dayDuration * 0.775),
      },
    })
  }

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
