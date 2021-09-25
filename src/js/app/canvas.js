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

    engine.loop.on('frame', onFrame)
    engine.state.on('reset', onReset)

    window.addEventListener('resize', onResize)
    onResize()
  })

  function clear() {
    context.clearRect(0, 0, width, height)
  }

  function crossfade() {
    const copy = document.createElement('canvas')

    copy.className = 'a-app--canvas a-app--canvas-crossfade'
    copy.height = height
    copy.width = width

    copy.getContext('2d').drawImage(root, 0, 0, width, height)

    root.parentNode.appendChild(copy)
    copy.onanimationend = () => copy.remove()
  }

  function draw() {
    app.canvas.camera.update()
    app.canvas.tracers.prime()

    clear()
    app.canvas.light.draw()
    app.canvas.stars.draw()
    app.canvas.celestials.draw()
    app.canvas.surface.draw()
    app.canvas.nodes.draw()
    app.canvas.tracers.draw()
    app.canvas.grain.draw()
    app.canvas.hud.draw()

    if (app.debug) {
      app.debug.canvas.draw()
    }
  }

  function onFrame({paused}) {
    if (paused) {
      return
    }

    app.canvas.light.recalculate()

    if (!app.settings.computed.graphicsOn || document.visibilityState == 'hidden') {
      return
    }

    draw()
  }

  function onReset() {
    crossfade()
  }

  function onResize() {
    recalculate()
    pubsub.emit('resize')

    if (engine.loop.isPaused()) {
      draw()
    }
  }

  function recalculate() {
    height = root.height = root.clientHeight
    width = root.width = root.clientWidth
    aspect = width / height
    hfov = app.settings.computed.graphicsFov
    vfov = hfov / aspect
  }

  return engine.utility.pubsub.decorate({
    aspect: () => aspect,
    clear,
    context: () => context,
    crossfade: () => {
      crossfade()
      return this
    },
    forceResize: function () {
      onResize()
      return this
    },
    forceUpdate: function () {
      if (app.settings.computed.graphicsOn) {
        draw()
      } else {
        clear()
      }

      return this
    },
    height: () => height,
    hfov: () => hfov,
    toRelative: (vector) => {
      if (!engine.utility.vector3d.prototype.isPrototypeOf(vector)) {
        vector = engine.utility.vector3d.create(vector)
      }

      return vector
        .subtract(app.canvas.camera.computedVector())
        .rotateQuaternion(app.canvas.camera.computedQuaternionConjugate())
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
