app.screen.splash = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-splash')
    root.addEventListener('click', onInteract)

    app.utility.focus.trap(root)

    app.state.screen.on('enter-splash', onEnter)
    app.state.screen.on('exit-splash', onExit)

    root.querySelector('.a-splash--version').innerHTML = `v${app.version()}`
  })

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)
  }

  function onExit() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame(e) {
    const ui = app.controls.ui()

    if (ui.confirm || ui.enter || ui.space || ui.start || ui.focus === 0) {
      onInteract()
    }

    if (ui.escape) {
      app.quit()
    }
  }

  function onInteract() {
    app.state.screen.dispatch('start')
  }

  return {}
})()
