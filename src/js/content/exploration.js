content.exploration = (() => {
  const list = [],
    radius = 1,
    tree = engine.utility.octree.create({
      maxItems: 100,
    })

  function addNode(node) {
    const vector = engine.utility.vector3d.create(node)

    // XXX: Used by app.canvas.nodes, cached here for simplicity
    vector.phase = Math.random()
    vector.time = engine.audio.time() + node.distanceRatio

    list.push(vector)
    tree.insert(vector)

    return vector
  }

  return {
    add: function (node) {
      const checkNearby = tree.find(node, radius)

      if (!checkNearby) {
        addNode(node)
      }

      return this
    },
    export: () => list.map((vector) => vector.clone()),
    find: (...args) => tree.find(...args),
    import: function (values = []) {
      values.map(addNode)
      return this
    },
    isUnique: (voxel) => !tree.find(voxel, radius),
    onCollision: function (voxel) {
      if (this.isUnique(voxel)) {
        addNode(voxel)
      }

      return this
    },
    onScan: function (scan) {
      if (!scan.isAudible || !scan.isFloor) {
        return this
      }

      const results = [
        ...scan.scan2d.flat(),
        ...scan.scan3d,
      ]

      for (const result of results) {
        if (result && !result.remember) {
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
    tree: () => tree,
  }
})()

engine.ready(() => {
  content.movement.on('underwater-collision', ({voxel}) => content.exploration.onCollision(voxel))
  content.scan.on('recharge', (scan) => content.exploration.onScan(scan))
})

engine.state.on('export', (data) => data.exploration = content.exploration.export())
engine.state.on('import', (data) => content.exploration.import(data.exploration))
engine.state.on('reset', () => content.exploration.reset())
