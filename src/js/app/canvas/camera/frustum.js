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
    cone.normal = app.canvas.camera.computedQuaternion().forward()
    cone.radius = cone.height / Math.sin(C) * Math.sin(A)
    cone.vertex = app.canvas.camera.computedVector().subtract(
      cone.normal.scale(leeway)
    )
  }

  function updateNearPlane() {
    nearPlane.normal = app.canvas.camera.computedQuaternion().forward()
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
    cullOctree: function (tree, depth = 0) {
      if (!depth && tree.items.length) {
        return [...tree.items]
      }

      const center = {
        x: tree.x + (tree.width / 2),
        y: tree.y + (tree.height / 2),
        z: tree.z + (tree.depth / 2),
      }

      const radius = Math.max(tree.height, tree.width, tree.depth)

      if (!this.containsSphere(center, radius)) {
        return []
      }

      if (tree.items.length) {
        return [...tree.items]
      }

      const items = []
      depth += 1

      for (const subtree of tree.nodes) {
        items.push(...this.cullOctree(subtree, depth))
      }

      return items
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
