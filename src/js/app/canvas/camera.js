app.canvas.camera = (() => {
  let computedQuaternion = engine.utility.quaternion.create(),
    computedQuaternionConjugate = engine.utility.quaternion.create(),
    computedVector = engine.utility.vector3d.create(),
    forward = engine.utility.vector3d.create(),
    quaternion = engine.utility.quaternion.create(),
    vector = engine.utility.vector3d.create()

  return {
    applyLookY: function (value) {
      // TODO: Consider additional acceleration, like how content.movement handles rotation
      // TODO: Invert look setting (for the monsters)

      if (!value) {
        return this
      }

      const isInverted = false,
        pitch = (isInverted ? 1 : -1) * engine.utility.sign(value) * Math.PI/2

      // Convert pitch to target quaternion (fancy!)
      const target = engine.utility.quaternion.create({
        w: Math.cos(pitch/2),
        y: Math.sin(pitch/2),
      })

      // Accelerate to target quaternion, faster as |value| grows larger
      quaternion.w = content.utility.accelerate.value(quaternion.w, target.w, Math.abs(value))
      quaternion.y = content.utility.accelerate.value(quaternion.y, target.y, Math.abs(value))

      return this
    },
    computedQuaternion: () => computedQuaternion,
    computedQuaternionConjugate: () => computedQuaternionConjugate,
    computedVector: () => computedVector,
    getQuaternion: () => quaternion.clone(),
    getVector: () => vector.clone(),
    reset: function () {
      computedQuaternion = engine.utility.quaternion.create()
      computedQuaternionConjugate = engine.utility.quaternion.create()
      computedVector = engine.utility.vector3d.create()
      quaternion = engine.utility.quaternion.create()
      vector = engine.utility.vector3d.create()

      return this
    },
    setQuaternion: function (value) {
      quaternion = engine.utility.quaternion.create(value)
      return this
    },
    setVector: function (value) {
      vector = engine.utility.vector3d.create(value)
      return this
    },
    update: function () {
      computedQuaternion = engine.position.getQuaternion().multiply(quaternion)
      computedQuaternionConjugate = computedQuaternion.conjugate()
      computedVector = engine.position.getVector().add(vector)

      return this
    },
  }
})()

engine.state.on('reset', () => app.canvas.camera.reset())
