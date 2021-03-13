app.canvas = (() => {
  const pubsub = engine.utility.pubsub.create()

  let aspect,
    context,
    height,
    hfov,
    root,
    vfov,
    width

  engine.ready(() => {
    root = document.querySelector('.a-app--canvas')
    context = root.getContext('2d')

    app.state.screen.on('enter-game', onEnterGame)
    app.state.screen.on('exit-game', onExitGame)

    window.addEventListener('resize', onResize)

    // TODO: app.settings.computed.graphicsFov is undefined
    setTimeout(onResize, 0)
  })

  function clear() {
    context.clearRect(0, 0, width, height)
  }

  function onEnterGame() {
    if (!app.settings.computed.graphicsOn) {
      return
    }

    pubsub.emit('enter')
    engine.loop.on('frame', onFrame)
  }

  function onExitGame() {
    pubsub.emit('exit')
    engine.loop.off('frame', onFrame)
  }

  function onFrame(e) {
    // Drawing order is back-to-front
    clear()
    app.canvas.nodes.draw(e)
    app.canvas.light.draw(e)
    app.canvas.stars.draw(e)
    app.canvas.celestials.draw(e)
    app.canvas.surface.draw(e)
    app.canvas.grain.draw(e)
    app.canvas.hud.draw(e)
  }

  function onResize() {
    height = root.height = root.clientHeight
    width = root.width = root.clientWidth
    aspect = width / height
    hfov = app.settings.computed.graphicsFov
    vfov = hfov / aspect

    pubsub.emit('resize')
  }

  return engine.utility.pubsub.decorate({
    aspect: () => aspect,
    context: () => context,
    height: () => height,
    hfov: () => hfov,
    toRelative: (vector) => {
      return vector
        .subtract(engine.position.getVector())
        .rotateQuaternion(engine.position.getQuaternion().conjugate())
    },
    toScreenFromGlobal: function (vector) {
      return this.toScreenFromRelative(
        this.toRelative(vector)
      )
    },
    toScreenFromRelative: (relative) => {
      const hangle = Math.atan2(relative.y, relative.x),
        vangle = Math.atan2(relative.z, relative.x)

      return engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })
    },
    vfov: () => vfov,
    width: () => width,
  }, pubsub)
})()
