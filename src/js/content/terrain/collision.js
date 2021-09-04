content.terrain.collision = (() => {
  const deltas = [],
    granularity = 1/4,
    radius = 1/2

  // Cache deltas to check
  for (let z = -radius; z <= radius; z += granularity) {
    for (let y = -radius; y <= radius; y += granularity) {
      for (let x = -radius; x <= radius; x += granularity) {
        const vector = engine.utility.vector3d.create({
          x,
          y,
          z,
        })

        if (vector.distance() <= radius) {
          deltas.push(vector)
        }
      }
    }
  }

  // Sort deltas by distance (outside to inside) to optimize movement checks
  deltas.sort((a, b) => {
    return b.distance() - a.distance()
  })

  return {
    check: ({
      x = 0,
      y = 0,
      z = 0,
    } = engine.position.getVector()) => {
      for (const delta of deltas) {
        const point = delta.add({x, y, z}),
          voxel = content.terrain.voxels.get(point)

        if (voxel.isSolid) {
          return {...voxel}
        }
      }

      return false
    },
  }
})()
