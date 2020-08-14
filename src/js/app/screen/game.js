app.screen.game = (() => {
  let root

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.back || ui.backspace || ui.escape || ui.start) {
      app.state.screen.dispatch('gameMenu')
    }
  }

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)
    engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, 1, 1)
    engine.loop.resume()
  }

  function onExit() {
    engine.loop.pause()
    engine.loop.off('frame', onFrame)
    engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, engine.const.zeroGain, 1)
  }

  function onFrame(e) {
    handleControls(e)
  }

  return {
    activate: function () {
      root = document.querySelector('.a-game')
      app.utility.focus.trap(root)

      app.state.screen.on('enter-game', onEnter)
      app.state.screen.on('exit-game', onExit)

      return this
    },
  }
})()

app.once('activate', () => app.screen.game.activate())
