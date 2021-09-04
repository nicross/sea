content.exploration = (() => {
  const list = [],
    radius = 1,
    tree = engine.utility.octree.create({
      maxItems: 100,
    })

  function addNode(node) {
    const vector = engine.utility.vector3d.create(node)

    list.push(vector)
    tree.insert(vector)

    return vector
  }

  return {
    export: () => [...list],
    find: (...args) => tree.find(...args),
    import: function (values = []) {
      values.map(addNode)
      return this
    },
    onCollision: function (voxel) {
      const checkNearby = tree.find(voxel, radius)

      if (!checkNearby) {
        addNode(voxel)
      }

      return this
    },
    onScan: function (scan) {
      for (const result of Object.values(scan)) {
        if (result && !result.isSolid) {
          continue
        }

        const checkNearby = tree.find(result, radius)

        if (checkNearby) {
          continue
        }

        addNode(result)
      }

      return this
    },
    reset: function () {
      list.length = 0
      tree.clear()
      return this
    },
    retrieve: (...args) => tree.retrieve(...args),
  }
})()

engine.ready(() => {
  content.movement.on('underwater-collision', ({voxel}) => content.exploration.onCollision(voxel))
  content.scan.on('recharge', (scan) => content.exploration.onScan(scan))
})

engine.state.on('export', (data) => data.exploration = content.exploration.export())
engine.state.on('import', (data) => content.exploration.import(data.exploration))
engine.state.on('reset', () => content.exploration.reset())
