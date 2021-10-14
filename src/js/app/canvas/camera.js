app.canvas.camera = (() => {
  let computedQuaternion = engine.utility.quaternion.create(),
    computedQuaternionConjugate = engine.utility.quaternion.create(),
    computedNormal = engine.utility.vector3d.create(),
    computedVector = engine.utility.vector3d.create(),
    computedVectorInverse = engine.utility.vector3d.create(),
    quaternion = engine.utility.quaternion.create(),
    vector = engine.utility.vector3d.create()

  return {
    applyLookY: function (value) {
      // TODO: Consider additional acceleration, like how content.movement handles rotation

      if (!value) {
        return this
      }

      const isInverted = app.settings.computed.invertLookY,
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
    computedQuaternion: () => computedQuaternion.clone(),
    computedQuaternionConjugate: () => computedQuaternionConjugate.clone(),
    computedNormal: () => computedNormal.clone(),
    computedVector: () => computedVector.clone(),
    computedVectorInverse: () => computedVectorInverse.clone(),
    getQuaternion: () => quaternion.clone(),
    getVector: () => vector.clone(),
    reset: function () {
      computedNormal = engine.utility.vector3d.create()
      computedQuaternion = engine.utility.quaternion.create()
      computedQuaternionConjugate = engine.utility.quaternion.create()
      computedVector = engine.utility.vector3d.create()
      computedVectorInverse = engine.utility.vector3d.create()
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
    toRelative: (vector) => {
      return computedVectorInverse.add(vector)
        .rotateQuaternion(computedQuaternionConjugate)
    },
    toScreenFromGlobal: function (vector) {
      return this.toScreenFromRelative(
        computedVectorInverse.add(vector)
          .rotateQuaternion(computedQuaternionConjugate)
      )
    },
    toScreenFromRelative: (relative) => {
      const hangle = Math.atan2(relative.y, relative.x),
        height = app.canvas.height(),
        hfov = app.canvas.hfov(),
        width = app.canvas.width(),
        vangle = Math.atan2(relative.z, relative.x),
        vfov = app.canvas.vfov()

      return engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })
    },
    update: function () {
      computedQuaternion = engine.position.getQuaternion().multiply(quaternion)
      computedQuaternionConjugate = computedQuaternion.conjugate()

      computedNormal = computedQuaternion.forward()

      computedVector = engine.position.getVector().add(vector)
      computedVectorInverse = computedVector.inverse()

      this.frustum.update()

      return this
    },
  }
})()

engine.state.on('reset', () => app.canvas.camera.reset())
