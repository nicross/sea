content.scan = (() => {
  const maxCount = 64,
    maxDistance = 100,
    minCount = 48,
    pubsub = engine.utility.pubsub.create()

  let isCooldown = false

  function doRaytrace(position, direction) {
    const stepDistance = content.terrain.voxels.granularity()

    const {
      x: dx,
      y: dy,
      z: dz,
    } = direction

    let {x, y, z} = position

    let distance = 0,
      isSolid

    do {
      x += dx
      y += dy
      z += dz
      distance += stepDistance
      isSolid = content.terrain.voxels.get({x, y, z}).isSolid
    } while (!isSolid && ((distance + stepDistance) <= maxDistance))

    return {
      distance,
      distanceRatio: engine.utility.clamp(engine.utility.scale(distance, 0, maxDistance, 0, 1), 0, 1),
      isSolid,
      x,
      y,
      z,
      zRatio: smooth(engine.utility.clamp(engine.utility.scale(z - position.z, -maxDistance, maxDistance, 0, 1), 0, 1)),
    }
  }

  async function scanForward() {
    const heading = engine.position.getQuaternion(),
      position = engine.position.getVector(),
      results = [],
      stepDistance = content.terrain.voxels.granularity()

    // First result is directly forward
    const reverse = engine.utility.vector3d.create({
      x: 1,
    }).normalize().rotateQuaternion(heading).scale(stepDistance)

    results.push(
      await scheduleRaytrace(position, reverse)
    )

    // Scan random forward directions
    const count = engine.utility.random.float(minCount, maxCount)

    for (let i = 0; i < count; i += 1) {
      const direction = engine.utility.vector3d.create({
        x: engine.utility.random.float(0, 1),
        y: engine.utility.random.float(-1, 1),
        z: engine.utility.random.float(-1, 1),
      }).normalize().rotateQuaternion(heading).scale(stepDistance)

      const result = await scheduleRaytrace(position, direction)

      if (result.isSolid) {
        results.push(result)
      }
    }

    return results
  }

  async function scanReverse() {
    const heading = engine.position.getQuaternion(),
      position = engine.position.getVector(),
      results = [],
      stepDistance = content.terrain.voxels.granularity()

    // First result is directly reverse
    const reverse = engine.utility.vector3d.create({
      x: -1,
    }).normalize().rotateQuaternion(heading).scale(stepDistance)

    results.push(
      await scheduleRaytrace(position, reverse)
    )

    // Scan random reverse directions
    const count = engine.utility.random.float(minCount, maxCount)

    for (let i = 0; i < count; i += 1) {
      const direction = engine.utility.vector3d.create({
        x: engine.utility.random.float(-1, 0),
        y: engine.utility.random.float(-1, 1),
        z: engine.utility.random.float(-1, 1),
      }).normalize().rotateQuaternion(heading).scale(stepDistance)

      const result = await scheduleRaytrace(position, direction)

      if (result.isSolid) {
        results.push(result)
      }
    }

    return results
  }

  async function scheduleRaytrace(...args) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(doRaytrace(...args))
      })
    })
  }

  function smooth(value) {
    // 6x^5 - 15x^4 + 10x^3
    return (value * value * value) * (value * ((value * 6) - 15) + 10)
  }

  return engine.utility.pubsub.decorate({
    benchmark: async function () {
      const start = performance.now()
      await this.triggerForward()
      return performance.now() - start
    },
    isCooldown: () => isCooldown,
    triggerForward: async function () {
      if (isCooldown) {
        return this
      }

      const {z} = engine.position.getVector()

      // Disallow use on surface
      if (z >= content.surface.current()) {
        return this
      }

      isCooldown = true
      pubsub.emit('trigger', {forward: true})

      // Don't bother hurting the frame rate if nothing to see
      const results = z >= engine.const.lightZone
        ? {}
        : await scanForward()

      pubsub.emit('complete', results)

      engine.utility.timing.promise(content.const.scanCooldown * 1000).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
    triggerReverse: async function () {
      if (isCooldown) {
        return this
      }

      const {z} = engine.position.getVector()

      // Disallow use on surface
      if (z >= content.surface.current()) {
        return this
      }

      isCooldown = true
      pubsub.emit('trigger', {reverse: true})

      // Don't bother hurting the frame rate if nothing to see
      const results = z >= engine.const.lightZone
        ? {}
        : await scanReverse()

      pubsub.emit('complete', results)

      engine.utility.timing.promise(content.const.scanCooldown * 1000).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
  }, pubsub)
})()

content.scan.on('trigger', () => {
  engine.loop.pause()
})

content.scan.on('recharge', () => {
  if (app.state.game.is('running')) {
    engine.loop.resume()
  }
})
