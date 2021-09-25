app.utility.plane = {}

app.utility.plane.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.utility.plane.prototype = {
  construct: function ({
    constant = 0,
    normal,
  } = {}) {
    this.constant = constant
    this.normal = engine.utility.vector3d.create(normal)

    this.normalize()

    return this
  },
  distanceToPoint: function (point) {
    return this.normal.dotProduct(point) + this.constant
  },
  normalize: function () {
    const distance = this.normal.distance()

    if (distance == 1) {
      return this
    }

    const inverse = 1 / distance

    this.constant *= inverse
    this.normal = this.normal.scale(inverse)

    return this
  },
  replace: function (x, y, z, constant) {
    this.constant = constant
    this.normal = engine.utility.vector3d.create({x, y, z})

    this.normalize()

    return this
  }
}
