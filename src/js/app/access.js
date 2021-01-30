app.access = (() => {
  const hotkeys = {
    coordinates: () => {
      const position = engine.position.getVector()
      return app.utility.format.coordinates(position)
    },
    heading: () => {
      const {yaw} = engine.position.getEuler()
      return app.utility.format.angle(yaw)
    },
    x: () => {
      const {x} = engine.position.getVector()

      return x >= 0
        ? `${app.utility.format.number(x)} east`
        : `${app.utility.format.number(-x)} west`
    },
    y: () => {
      const {y} = engine.position.getVector()

      return y >= 0
        ? `${app.utility.format.number(y)} north`
        : `${app.utility.format.number(-y)} south`
    },
    z: () => {
      const position = engine.position.getVector()

      if (position.z < 0) {
        return `${app.utility.format.number(-position.z)} meters`
      }
    },
  }

  let root

  engine.ready(() => {
    root = document.querySelector('.a-app--access')
  })

  return {
    handle: function (hotkey) {
      const value = hotkey in hotkeys
        ? hotkeys[hotkey]()
        : undefined

      if (value) {
        this.set(value)
      }

      return this
    },
    set: function (value = '') {
      root.innerHTML = ''
      root.innerHTML = value
      return this
    },
  }
})()
