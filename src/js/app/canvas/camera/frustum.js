app.canvas.camera.frustum = (() => {
  const cone = app.utility.cone.create(),
    nearPlane = app.utility.plane.create(),
    sphere = app.utility.sphere.create()

  function updateCone() {
    // This outer cone contains points with a 1:1 aspect ratio

    const drawDistance = app.settings.computed.drawDistanceStatic,
      fov = Math.max(app.canvas.hfov(), app.canvas.vfov()),
      leeway = 4

    // Solve triangle
    const A = fov/2
    const B = Math.PI/2
    const C = Math.PI - A - B

    // Update cone
    cone.height = drawDistance + leeway
    cone.normal = app.canvas.camera.computedNormal()
    cone.radius = cone.height / Math.sin(C) * Math.sin(A)
    cone.vertex = app.canvas.camera.computedVector().subtract(
      cone.normal.scale(leeway)
    )
  }

  function updateNearPlane() {
    nearPlane.normal = app.canvas.camera.computedNormal()
  }

  function updateSphere() {
    sphere.center = app.canvas.camera.computedVector()
    sphere.radius = app.settings.computed.drawDistanceStatic
  }

  return {
    cone: () => cone,
    containsPoint: function (point) {
      if (nearPlane.distanceToPoint(point) < 0) {
        return false
      }

      if (!sphere.containsPoint(point)) {
        return false
      }

      if (!cone.containsPoint(point)) {
        return false
      }

      // Maybe there will be a true frustum here someday

      return true
    },
    containsSphere: function (center, radius = 0) {
      // XXX: Includes intersections

      if (nearPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (!sphere.containsSphere(center, radius)) {
        return false
      }

      if (!cone.containsSphere(center, radius)) {
        return false
      }

      // Maybe there will be a true frustum here someday

      return true
    },
    cullOctree: function (tree) {
      return app.utility.octree.reduce(tree, (center, radius) => this.containsSphere(center, radius))
    },
    nearPlane: () => nearPlane,
    sphere: () => sphere,
    update: function () {
      updateCone()
      updateNearPlane()
      updateSphere()

      return this
    },
  }
})()
