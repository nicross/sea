'use strict'

app.screen.mainMenu = (() => {
  let root

  function handleControls() {
    const controls = app.controls.ui()

    if (controls.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if (controls.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (controls.down) {
      return app.utility.focus.setNextFocusable(root)
    }
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    root.querySelector('.a-mainMenu--action-continue').hidden = !app.storage.hasGame()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  app.once('activate', () => {
    root = document.querySelector('.a-mainMenu')

    app.state.screen.on('enter-mainMenu', onEnter)
    app.state.screen.on('exit-mainMenu', onExit)

    Object.entries({
      continue: root.querySelector('.a-mainMenu--continue'),
      exitToDesktop: root.querySelector('.a-mainMenu--exitToDesktop'),
      newGame: root.querySelector('.a-mainMenu--newGame'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    root.querySelector('.a-mainMenu--action-exitToDesktop').hidden = !app.isElectron()

    app.utility.focus.trap(root)
  })

  return {}
})()
