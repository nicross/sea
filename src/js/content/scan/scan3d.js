content.scan.scan3d = (() => {
  const maxCount = 64,
    maxDistance = 100,
    minCount = 64

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
      isWorm: content.terrain.worms.isInside(x, y, z, 1),
      remember: isSolid,
      relativeZ: z - position.z,
      x,
      y,
      z,
    }
  }

  async function scanForward() {
    const heading = engine.position.getQuaternion(),
      position = engine.position.getVector(),
      results = [],
      stepDistance = content.terrain.voxels.granularity()

    // First result is directly forward
    const forward = engine.utility.vector3d.create({
      x: 1,
    }).normalize().rotateQuaternion(heading).scale(stepDistance)

    results.push(
      await content.utility.async.schedule(() => doRaytrace(position, forward))
    )

    // Scan random forward directions
    const count = engine.utility.random.float(minCount, maxCount)

    for (let i = 0; i < count; i += 1) {
      const direction = engine.utility.vector3d.create({
        x: engine.utility.random.float(0, 1),
        y: engine.utility.random.float(-1, 1),
        z: engine.utility.random.float(-1, 1),
      }).normalize().rotateQuaternion(heading).scale(stepDistance)

      results.push(
        await content.utility.async.schedule(() => doRaytrace(position, direction))
      )
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
      await content.utility.async.schedule(() => doRaytrace(position, reverse))
    )

    // Scan random reverse directions
    const count = engine.utility.random.float(minCount, maxCount)

    for (let i = 0; i < count; i += 1) {
      const direction = engine.utility.vector3d.create({
        x: engine.utility.random.float(-1, 0),
        y: engine.utility.random.float(-1, 1),
        z: engine.utility.random.float(-1, 1),
      }).normalize().rotateQuaternion(heading).scale(stepDistance)

      results.push(
        await content.utility.async.schedule(() => doRaytrace(position, direction))
      )
    }

    return results
  }

  return {
    forward: async () => {
      const {z} = engine.position.getVector()

      if (z > content.const.lightZone) {
        return []
      }

      let results = []

      try {
        results = await scanForward()
      } catch (e) {}

      return results
    },
    maxDistance: () => maxDistance,
    reverse: async () => {
      const {z} = engine.position.getVector()

      if (z > content.const.lightZone) {
        return []
      }

      let results = []

      try {
        results = await scanReverse()
      } catch (e) {}

      return results
    },
  }
})()
