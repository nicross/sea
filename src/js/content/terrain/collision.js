content.terrain.collision = (() => {
  const deltas = [],
    granularity = 1/4,
    radius = 0.5

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
          return true
        }
      }

      return false
    },
  }
})()
