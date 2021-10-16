app.splash = (() => {
  const generators = []

  return {
    add: function (generator) {
      generators.push(generator)
      return this
    },
    apply: function ({
      camera,
      state,
    }) {
      engine.state.import(state)
      app.canvas.camera.setQuaternion(camera)
      return this
    },
    applyRandom: function () {
      const generator = engine.utility.choose(generators)
      const definition = generator()
      return this.apply(definition)
    },
  }
})()

// Classic v1.4.0 splash
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
})
