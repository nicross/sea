content.scan.scan2d = (() => {
  const maxDistance = 100,
    unitX = engine.utility.vector2d.unitX()

  function doRaytrace(position, plane, direction) {
    const results = []

    let {
      x: dx,
      y: dy,
    } = direction

    let {x, y} = position

    for (let d = 0; d < maxDistance; d += 1) {
      x += dx
      y += dy

      const result = {
        x,
        y,
        z: plane.value(x, y),
      }

      result.remember = plane === content.terrain.floor
        ? !content.terrain.worms.isInside(x, y, result.z)
        : false

      results.push(result)
    }

    return results
  }

  function getPlane() {
    const {z} = engine.position.getVector()

    if (z > content.const.lightZone / 2) {
      return content.surface
    }

    if (z < content.const.lightZone) {
      return content.terrain.floor
    }
  }

  async function scanForward(plane) {
    const heading = engine.position.getEuler().yaw,
      position  = engine.position.getVector()

    const step = unitX.rotate(heading)

    return [
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI/2))), //right
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI/3))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI/6))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step)), //ahead
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(Math.PI/6))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(Math.PI/3))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(Math.PI/2))), //left
    ]
  }

  async function scanReverse(plane) {
    const heading = engine.position.getEuler().yaw,
      position  = engine.position.getVector()

    const step = unitX.rotate(heading)

    return [
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI/2))), //right
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI + Math.PI/3))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI + Math.PI/6))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI))), //behind
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI - Math.PI/6))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(-Math.PI - Math.PI/3))),
      await content.utility.async.schedule(() => doRaytrace(position, plane, step.rotate(Math.PI/2))), //left
    ]
  }

  return {
    forward: async () => {
      const plane = getPlane()

      if (!plane) {
        return []
      }

      let results = []

      try {
        results = await scanForward(plane)
      } catch (e) {}

      return results
    },
    reverse: async () => {
      const plane = getPlane()

      if (!plane) {
        return []
      }

      let results = []

      try {
        results = await scanReverse(plane)
      } catch (e) {}

      return results
    },
  }
})()
