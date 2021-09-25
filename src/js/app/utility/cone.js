app.utility.cone = {}

app.utility.cone.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.utility.cone.prototype = {
  construct: function ({
    height = 0,
    normal,
    radius = 0,
    vertex,
  } = {}) {
    this.height = height
    this.normal = engine.utility.vector3d.create(normal)
    this.radius = radius
    this.vertex = engine.utility.vector3d.create(vertex)

    return this
  },
  containsPoint: function (point) {
    const relative = this.vertex.inverse().add(point)
    const distance = Math.abs(relative.dotProduct(this.normal))

    if (!engine.utility.between(distance, 0, this.height)) {
      return false
    }

    const coneRadius = (distance / this.height) * this.radius

    const perpendicular = relative.subtract(
      this.normal.scale(distance)
    ).distance()

    return perpendicular < coneRadius
  },
  containsSphere: function (center, radius) {
    const relative = this.vertex.inverse().add(center)
    const distance = Math.abs(relative.dotProduct(this.normal))

    if (!engine.utility.between(distance, -radius, this.height + radius)) {
      return false
    }

    const coneRadius = (distance / this.height) * this.radius

    const perpendicular = relative.subtract(
      this.normal.scale(distance)
    ).distance()

    return perpendicular < (coneRadius + radius)
  },
}
