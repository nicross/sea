app.canvas.camera.frustum = (() => {
  const cone = app.utility.cone.create(),
    farPlane = app.utility.plane.create(),
    nearPlane = app.utility.plane.create(),
    sphere = app.utility.sphere.create()

  const planes = [
    app.utility.plane.create(),
    app.utility.plane.create(),
    app.utility.plane.create(),
    app.utility.plane.create(),
  ]

  function checkPlanesPoint(point) {
    for (const plane of planes) {
      if (plane.distanceToPoint(point) < 0) {
        return false
      }
    }

    return true
  }

  function checkPlanesSphere(center, radius) {
    for (const plane of planes) {
      if (plane.distanceToPoint(center) < -radius) {
        return false
      }
    }

    return true
  }

  function solveTriangle(angle, height) {
    const A = angle/2
    const B = Math.PI/2
    const C = Math.PI - A - B

    return height / Math.sin(C) * Math.sin(A)
  }

  function updateCone() {
    // This outer cone contains points with a 1:1 aspect ratio

    const drawDistance = app.settings.computed.drawDistanceStatic,
      fov = Math.max(app.canvas.hfov(), app.canvas.vfov()),
      leeway = 4

    // Update cone
    cone.height = drawDistance + leeway
    cone.normal = app.canvas.camera.computedNormal()
    cone.radius = solveTriangle(fov, cone.height)
    cone.vertex = app.canvas.camera.computedVector().subtract(
      cone.normal.scale(leeway)
    )
  }

  function updatePlanes() {
    const hfov = app.canvas.hfov() / 2,
      normal = app.canvas.camera.computedNormal(),
      quaternion = app.canvas.camera.computedQuaternion(),
      position = app.canvas.camera.computedVector(),
      vfov = app.canvas.vfov() / 2

    // nearPlane
    nearPlane.constant = normal.dotProduct(position)
    nearPlane.normal = normal.clone()

    // farPlane
    farPlane.normal = normal.inverse()
    farPlane.constant = farPlane.normal.dotProduct(
      position.add(
        normal.scale(app.settings.computed.drawDistanceStatic)
      )
    )

    // Left plane
    planes[0].normal = engine.utility.vector3d.create({
      x: Math.sin(hfov),
      y: -Math.cos(hfov),
    }).rotateQuaternion(quaternion)

    planes[0].constant = planes[0].normal.dotProduct(position)

    // Right plane
    planes[1].normal = engine.utility.vector3d.create({
      x: Math.sin(hfov),
      y: Math.cos(hfov),
    }).rotateQuaternion(quaternion)

    planes[1].constant = planes[1].normal.dotProduct(position)

    // Upper plane
    planes[2].normal = engine.utility.vector3d.create({
      x: Math.sin(vfov),
      z: Math.cos(vfov),
    }).rotateQuaternion(quaternion)

    planes[2].constant = planes[2].normal.dotProduct(position)

    // Lower plane
    planes[3].normal = engine.utility.vector3d.create({
      x: Math.sin(vfov),
      z: -Math.cos(vfov),
    }).rotateQuaternion(quaternion)

    planes[3].constant = planes[3].normal.dotProduct(position)
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

      if (farPlane.distanceToPoint(point) < 0) {
        return false
      }

      if (!sphere.containsPoint(point)) {
        return false
      }

      if (!cone.containsPoint(point)) {
        return false
      }

      return checkPlanesPoint(point)
    },
    containsPointInPlanes: function (point) {
      if (nearPlane.distanceToPoint(point) < 0) {
        return false
      }

      if (farPlane.distanceToPoint(point) < 0) {
        return false
      }

      return checkPlanesPoint(point)
    },
    containsPointNoPlanes: function (point) {
      if (nearPlane.distanceToPoint(point) < 0) {
        return false
      }

      if (farPlane.distanceToPoint(point) < 0) {
        return false
      }

      if (!sphere.containsPoint(point)) {
        return false
      }

      if (!cone.containsPoint(point)) {
        return false
      }

      return true
    },
    containsSphere: function (center, radius = 0) {
      // XXX: Includes intersections

      if (nearPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (farPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (!sphere.containsSphere(center, radius)) {
        return false
      }

      if (!cone.containsSphere(center, radius)) {
        return false
      }

      return checkPlanesSphere(center, radius)
    },
    containsSphereInPlanes: function (center, radius = 0) {
      // XXX: Includes intersections

      if (nearPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (farPlane.distanceToPoint(center) < -radius) {
        return false
      }

      return checkPlanesSphere(center, radius)
    },
    containsSphereNoPlanes: function (center, radius = 0) {
      // XXX: Includes intersections

      if (nearPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (farPlane.distanceToPoint(center) < -radius) {
        return false
      }

      if (!sphere.containsSphere(center, radius)) {
        return false
      }

      if (!cone.containsSphere(center, radius)) {
        return false
      }

      return true
    },
    nearPlane: () => nearPlane,
    planes: () => [...planes],
    sphere: () => sphere,
    update: function () {
      updateCone()
      updatePlanes()
      updateSphere()

      return this
    },
  }
})()
