content.system.scan = (() => {
  const maxDistance = 50,
    pubsub = engine.utility.pubsub.create(),
    stepDistance = 1/4,
    unit2 = Math.sqrt(2) / 2,
    unit3 = Math.sqrt(3) / 3

  let isCooldown = false

  function doRaytrace(position, vector) {
    let {
      x: dx = 0,
      y: dy = 0,
    } = engine.utility.rotatePoint(vector.x || 0, vector.y || 0, -position.angle)

    let dz = vector.z || 0

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

    return {
      distance: d,
      isSolid,
      ratio: isSolid ? d / maxDistance : Infinity,
      x,
      y,
      z,
    }
  }

  async function scan() {
    const {angle, x, y} = engine.position.get()
    const z = content.system.z.get()

    if (z >= engine.const.lightZone) {
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
      down: await scheduleRaytrace(position, {z: -1}),
      forward: await scheduleRaytrace(position, {x: 1}),
      forwardDown: await scheduleRaytrace(position, {x: unit2, z: -unit2}),
      forwardLeft: await scheduleRaytrace(position, {x: unit2, y: -unit2}),
      forwardLeftDown: await scheduleRaytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      forwardLeftUp: await scheduleRaytrace(position, {x: unit3, y: -unit3, z: unit3}),
      forwardRight: await scheduleRaytrace(position, {x: unit2, y: unit2}),
      forwardRightDown: await scheduleRaytrace(position, {x: unit3, y: unit3, z: -unit3}),
      forwardRightUp: await scheduleRaytrace(position, {x: unit3, y: unit3, z: unit3}),
      forwardUp: await scheduleRaytrace(position, {x: unit2, z: unit2}),
      left: await scheduleRaytrace(position, {y: -1}),
      leftDown: await scheduleRaytrace(position, {y: -unit2, z: -unit2}),
      leftUp: await scheduleRaytrace(position, {y: -unit2, z: unit2}),
      reverse: await scheduleRaytrace(position, {x: -1}),
      reverseDown: await scheduleRaytrace(position, {x: -unit2, z: -unit2}),
      reverseLeft: await scheduleRaytrace(position, {x: -unit2, y: -unit2}),
      reverseLeftDown: await scheduleRaytrace(position, {x: -unit3, y: -unit3, z: -unit3}),
      reverseLeftUp: await scheduleRaytrace(position, {x: -unit3, y: -unit3, z: unit3}),
      reverseRight: await scheduleRaytrace(position, {x: unit2, y: -unit2}),
      reverseRightDown: await scheduleRaytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      reverseRightUp: await scheduleRaytrace(position, {x: unit3, y: -unit3, z: unit3}),
      reverseUp: await scheduleRaytrace(position, {x: -unit2, z: unit2}),
      right: await scheduleRaytrace(position, {y: 1}),
      rightDown: await scheduleRaytrace(position, {y: unit2, z: -unit2}),
      rightUp: await scheduleRaytrace(position, {y: unit2, z: unit2}),
      up: await scheduleRaytrace(position, {z: 1}),
    }
  }

  async function scheduleRaytrace(...args) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(doRaytrace(...args))
      })
    })
  }

  return engine.utility.pubsub.decorate({
    benchmark: function () {
      const start = performance.now()
      this.trigger()
      return performance.now() - start
    },
    isCooldown: () => isCooldown,
    trigger: async function () {
      if (isCooldown) {
        return this
      }

      isCooldown = true
      pubsub.emit('trigger')

      const results = await scan()
      pubsub.emit('complete', results)

      engine.utility.timing.promise(content.const.scanCooldown).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
  }, pubsub)
})()
