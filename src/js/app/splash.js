app.splash = (() => {
  const generators = []

  return {
    add: function (generator, weight) {
      generators.push({generator, weight})
      return this
    },
    apply: function ({
      camera,
      state,
    } = {}) {
      engine.state.import(state)
      app.canvas.camera.setQuaternion(camera)
      return this
    },
    applyRandom: function () {
      const {generator} = engine.utility.chooseWeighted(generators, Math.random())
      const definition = generator()
      return this.apply(definition)
    },
  }
})()

// Sunriser
app.splash.add(() => {
  const isRise = Math.random() > 0.5
  const isSun = Math.random() > 0.5

  const yawNoise = engine.utility.random.float(-1/120, 1/120)

  const yaw = isRise
    ? Math.PI * (1/8 + yawNoise)
    : Math.PI * (9/8 + yawNoise)

  const offset = isSun
    ? (
      isRise
        ? engine.utility.random.float(0.225, 0.275)
        : engine.utility.random.float(0.7, 0.725)
      )
    : (
      isRise
        ? engine.utility.random.float(0.725, 0.775)
        : engine.utility.random.float(0.2, 0.225)
      )

  const state = {
    position: {
      quaternion: engine.utility.quaternion.fromEuler({
        yaw,
      }),
      x: 0,
      y: 0,
      z: -engine.const.zero,
    },
    seed: Math.random(),
    time: {
      offset: offset * content.const.dayDuration,
    },
  }

  const camera = engine.utility.quaternion.create()

  return {
    camera,
    state,
  }
}, 4)

// Stargazer
app.splash.add(() => {
  const vfov = app.canvas.vfov() / 2,
    yawNoise = engine.utility.random.float(-1/120, 1/120) * Math.PI

  const angle = engine.utility.choose([
    (Math.PI * 1/2) + vfov,
    (Math.PI * 1/2) - vfov,
    (Math.PI * 3/2) + vfov,
    (Math.PI * 3/2) - vfov,
  ], Math.random()) + yawNoise

  const offset = engine.utility.random.float(0.875, 0.925)

  const state = {
    position: {
      quaternion: engine.utility.quaternion.fromEuler({
        yaw: angle,
      }),
      x: 0.5,
      y: 0.5,
      z: (1+4)/2,
    },
    seed: Math.random(),
    time: {
      offset: offset * content.const.dayDuration,
    },
  }

  const camera = engine.utility.quaternion.fromEuler({
    pitch: -Math.PI/2,
  })

  return {
    camera,
    state,
  }
}, 2)

// Sungazer
app.splash.add(() => {
  const isRise = Math.random() > 0.5
  const angle = engine.utility.random.float(-Math.PI/6, Math.PI/6) + (isRise ? 0 : Math.PI)

  const offset = isRise
    ? engine.utility.random.float(0.2625, 0.275)
    : engine.utility.random.float(0.60, 0.6125)

  const state = {
    position: {
      quaternion: engine.utility.quaternion.fromEuler({
        yaw: angle,
      }),
      x: 0,
      y: 0,
      z: -10,
    },
    seed: Math.random(),
    time: {
      offset: offset * content.const.dayDuration,
    },
  }

  const camera = engine.utility.quaternion.fromEuler({
    pitch: -Math.PI/6,
  })

  return {
    camera,
    state,
  }
}, 2)
