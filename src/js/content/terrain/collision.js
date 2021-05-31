content.terrain.collision = (() => {
  const deltas = [],
    granularity = 1/4,
    radius = 0.5,
    tree = engine.utility.octree.create()

  content.utility.ephemeralTree.manage(tree)

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

  function generateVoxel({x, y, z}) {
    const voxel = {
      isSolid: content.terrain.isSolid(x, y, z),
      x,
      y,
      z,
    }

    tree.insert(voxel)

    return voxel
  }

  function getVoxel(point) {
    return tree.find(point, engine.const.zero)
  }

  function snap(value = 0) {
    return (Math.round(value / granularity) * granularity) + (granularity / 2)
  }

  return {
    check: ({
      x = 0,
      y = 0,
      z = 0,
    } = engine.position.getVector()) => {
      const center = engine.utility.vector3d.create({
        x: snap(x),
        y: snap(y),
        z: snap(z),
      })

      for (const delta of deltas) {
        const point = delta.add(center),
          voxel = getVoxel(point) || generateVoxel(point)

        if (voxel.isSolid) {
          return true
        }
      }

      return false
    },
  }
})()
