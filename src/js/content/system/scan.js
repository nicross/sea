content.system.scan = (() => {
  const maxDistance = 50,
    stepDistance = 1,
    unit2 = Math.sqrt(2) / 2,
    unit3 = Math.sqrt(3) / 3

  let cooldownTimer = 0

  function raytrace(position, vector) {
    let {
      x: dx = 0,
      y: dy = 0,
      z: dz = 0,
    } = vector

    let {x, y, z} = position

    let d = 0,
      isSolid

    dx *= stepDistance
    dy *= stepDistance
    dz *= stepDistance

    do {
      x += dx
      y += dy
      z += dz
      d += stepDistance
      isSolid = content.system.terrain.isSolid(x, y, z)
    } while (!isSolid && d < maxDistance)

    return isSolid
      ? d / maxDistance
      : -1
  }

  function scan() {
    const {angle, x, y} = engine.position.get()
    const z = content.system.z.get()

    if (z >= 0) {
      // Empty results
      // Don't bother hurting the frame rate at the surface
      // But allow its use like a "honk"
      return {}
    }

    const position = {
      angle,
      x,
      y,
      z,
    }

    return {
      down: raytrace(position, {z: -1}),
      forward: raytrace(position, {x: 1}),
      forwardDown: raytrace(position, {x: unit2, z: -unit2}),
      forwardLeft: raytrace(position, {x: unit2, y: -unit2}),
      forwardLeftDown: raytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      forwardLeftUp: raytrace(position, {x: unit3, y: -unit3, z: unit3}),
      forwardRight: raytrace(position, {x: unit2, y: unit2}),
      forwardRightDown: raytrace(position, {x: unit3, y: unit3, z: -unit3}),
      forwardRightUp: raytrace(position, {x: unit3, y: unit3, z: unit3}),
      forwardUp: raytrace(position, {x: unit2, z: unit2}),
      left: raytrace(position, {y: -1}),
      leftDown: raytrace(position, {y: -unit2, z: -unit2}),
      leftUp: raytrace(position, {y: -unit2, z: unit2}),
      /*
      reverse: raytrace(position, {x: -1}),
      reverseDown: raytrace(position, {x: -unit2, z: -unit2}),
      reverseLeft: raytrace(position, {x: -unit2, y: -unit2}),
      reverseLeftDown: raytrace(position, {x: -unit3, y: -unit3, z: -unit3}),
      reverseLeftUp: raytrace(position, {x: -unit3, y: -unit3, z: unit3}),
      reverseRight: raytrace(position, {x: unit2, y: -unit2}),
      reverseRightDown: raytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      reverseRightUp: raytrace(position, {x: unit3, y: -unit3, z: unit3}),
      reverseUp: raytrace(position, {x: -unit2, z: unit2}),
      */
      right: raytrace(position, {y: 1}),
      rightDown: raytrace(position, {y: unit2, z: -unit2}),
      rightUp: raytrace(position, {y: unit2, z: unit2}),
      up: raytrace(position, {z: 1}),
    }
  }

  return {
    benchmark: function () {
      const start = performance.now()
      this.trigger()
      return performance.now() - start
    },
    trigger: function () {
      // Basic cooldown timer
      // TODO: Make more sophisticated, perhaps an audio cue indicating it's recharged
      if (performance.now() < cooldownTimer + content.const.scanCooldown) {
        return this
      }

      const results = scan()
      content.system.audio.scan.trigger(results)
      // TODO: generate treasure

      cooldownTimer = performance.now()

      return this
    },
  }
})()