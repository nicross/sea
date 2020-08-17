'use strict'

document.addEventListener('DOMContentLoaded', () => {
  engine.loop.start().pause()
  app.activate()

  engine.audio.mixer.master.param.limiter.attack.value = 0.003
  engine.audio.mixer.master.param.limiter.gain.value = 1
  engine.audio.mixer.master.param.limiter.knee.value = 15
  engine.audio.mixer.master.param.limiter.ratio.value = 15
  engine.audio.mixer.master.param.limiter.release.value = 0.125
  engine.audio.mixer.master.param.limiter.threshold.value = -30

  engine.audio.mixer.auxiliary.reverb.setImpulse(engine.audio.buffer.impulse.large())
  engine.audio.mixer.auxiliary.reverb.setGain(engine.utility.fromDb(-3))

  if (!app.isElectron()) {
    window.addEventListener('beforeunload', (e) => {
      if (app.state.game.is('running')) {
        e.preventDefault()
        e.returnValue = 'Quit S.E.A.?'
      }
    })
  }
})
