app.debug.test = {}

app.debug.test.camera = function (point) {
  const computedVectorInverse = app.canvas.camera.computedVectorInverse(),
    computedQuaternionConjugate = app.canvas.camera.computedQuaternionConjugate()

  const control = computedVectorInverse.add(point)
    .rotateQuaternion(computedQuaternionConjugate)

  const test = app.utility.matrix4d.fromQuaternion(
    computedQuaternionConjugate
  ).multiply(
    app.utility.matrix4d.fromVector3d(computedVectorInverse)
  ).applyToVector3d(point)

  const result = !engine.utility.round(control.x - test.x, 10)
    && !engine.utility.round(control.y - test.y, 10)
    && !engine.utility.round(control.z - test.z, 10)

  if (!result) {
    console.error(control, test)
  }

  return result
}

app.debug.test.cameraSuite = function (count = 1000000) {
  for (let i = 0; i < count; i += 1) {
    const point = {
      x: engine.utility.random.float(-1000, 1000),
      y: engine.utility.random.float(-1000, 1000),
      z: engine.utility.random.float(-1000, 1000),
    }

    if (!this.camera(point)) {
      return false
    }
  }

  return true
}

app.debug.test.matrix4d = function (point, euler, vector) {
  const control = engine.utility.vector3d.create(point).subtract(vector).rotateQuaternion(
    engine.utility.quaternion.fromEuler(euler).conjugate()
  )

  const test = app.utility.matrix4d.fromQuaternion(
    engine.utility.quaternion.fromEuler(euler).conjugate()
  ).multiply(
    app.utility.matrix4d.fromVector3d(
      engine.utility.vector3d.create(vector).inverse()
    )
  ).applyToVector3d(point)

  const result = !engine.utility.round(control.x - test.x, 10)
    && !engine.utility.round(control.y - test.y, 10)
    && !engine.utility.round(control.z - test.z, 10)

  if (!result) {
    console.error(control, test)
  }

  return result
}

app.debug.test.matrix4dSuite = function (count = 1000000) {
  for (let i = 0; i < count; i += 1) {
    const point = {
      x: engine.utility.random.float(-1000, 1000),
      y: engine.utility.random.float(-1000, 1000),
      z: engine.utility.random.float(-1000, 1000),
    }

    const euler = {
      pitch: engine.utility.random.float(-Math.PI, Math.PI),
      yaw: engine.utility.random.float(-2*Math.PI, 2*Math.PI),
    }

    const vector = {
      x: engine.utility.random.float(-1000, 1000),
      y: engine.utility.random.float(-1000, 1000),
      z: engine.utility.random.float(-1000, 1000),
    }

    if (!this.matrix4d(point, euler, vector)) {
      return false
    }
  }

  return true
}
