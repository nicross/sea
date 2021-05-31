content.terrain.voxels = (() => {
  const granularity = 1/4,
    tree = engine.utility.octree.create()

  content.utility.ephemeralTree.manage(tree)

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
    get: ({
      x = 0,
      y = 0,
      z = 0,
    } = {}) => {
      const point = engine.utility.vector3d.create({
        x: snap(x),
        y: snap(y),
        z: snap(z),
      })

      return getVoxel(point) || generateVoxel(point)
    },
    granularity: () => granularity,
  }
})()
