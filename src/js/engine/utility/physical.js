engine.utility.physical = {}

engine.utility.physical.decorate = function (target = {}) {
  if (!target.x) {
    target.x = 0
  }

  if (!target.y) {
    target.y = 0
  }

  if (!target.z) {
    target.z = 0
  }

  target.angularVelocity = engine.utility.quaternion.create()
  target.quaternion = engine.utility.quaternion.create()
  target.velocity = engine.utility.vector3d.create()

  Object.keys(this.decoration).forEach((key) => {
    target[key] = this.decoration[key]
  })

  return target
}

engine.utility.physical.decoration = {
  euler: function () {
    return engine.utility.euler.fromQuaternion(this.quaternion)
  },
  resetPhysics: function () {
    this.angularVelocity.set({w: 1})
    this.velocity.set()
    return this
  },
  updatePhysics: function () {
    const delta = engine.loop.delta()

    if (!this.angularVelocity.isZero()) {
      this.quaternion = this.quaternion.multiply(
        this.angularVelocity.lerpFrom({w: 1}, delta)
      )
    }

    if (!this.velocity.isZero()) {
      this.x += this.velocity.x * delta
      this.y += this.velocity.y * delta
      this.z += this.velocity.z * delta
    }
  },
  vector: function () {
    return engine.utility.vector3d.create(this)
  },
}
