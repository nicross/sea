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
    point = engine.utility.vector3d.create(point)

    const relative = point.subtract(this.vertex),
      length = relative.dotProduct(this.normal)

    if (!engine.utility.between(length, 0, this.height)) {
      return false
    }

    const coneRadius = (length / this.height) * this.radius,
      projected = this.vertex.add(this.normal.scale(length))

    const distance = point.distance(projected)

    return distance <= coneRadius
  },
  containsSphere: function (center, radius) {
    center = engine.utility.vector3d.create(center)

    const relative = center.subtract(this.vertex),
      length = relative.dotProduct(this.normal)

    if (!engine.utility.between(length, -radius, this.height + radius)) {
      return false
    }

    const coneRadius = (length / this.height) * this.radius,
      projected = this.vertex.add(this.normal.scale(length))

    const distance = center.distance(projected)

    return distance <= coneRadius + radius
  },
}
