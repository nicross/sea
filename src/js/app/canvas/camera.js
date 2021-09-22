app.canvas.camera = (() => {
  let computedQuaterion = engine.utility.quaternion.create(),
    computedVector = engine.utility.vector3d.create(),
    quaternion = engine.utility.quaternion.create(),
    vector = engine.utility.vector3d.create()

  return {
    computedQuaternion: () => computedQuaterion,
    computedVector: () => computedVector,
    getQuaternion: () => quaternion.clone(),
    getVector: () => vector.clone(),
    reset: function () {
      computedQuaterion = engine.utility.quaternion.create(),
      computedVector = engine.utility.vector3d.create(),
      quaternion = engine.utility.quaternion.create(),
      vector = engine.utility.vector3d.create()

      return this
    },
    setQuaternion: function (quaternion) {
      quaternion = engine.utility.quaternion.create(quaternion)
      return this
    },
    setVector: function (vector) {
      vector = engine.utility.vector3d.create(vector)
      return this
    },
    update: function () {
      computedQuaterion = engine.position.getQuaternion().multiply(quaternion).conjugate()
      computedVector = engine.position.getVector().add(vector)

      return this
    },
  }
})()

engine.state.on('reset', () => app.canvas.camera.reset())
