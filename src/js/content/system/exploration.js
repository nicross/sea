content.system.exploration = (() => {
  const list = [],
    tree = engine.utility.octree.create()

  function addNode(node) {
    const vector = engine.utility.vector3d.create(node)

    list.push(vector)
    tree.insert(vector)

    engine.streamer.registerProp(content.prop.exploration, {
      destination: content.system.audio.mixer.bus.music.bus(),
      x: node.x,
      y: node.y,
      z: node.z,
    })

    return vector
  }

  return {
    export: () => [...list],
    find: (...args) => tree.find(...args),
    import: function (values = []) {
      values.map(addNode)
      return this
    },
    onScan: function (scan) {
      const nodes = []

      for (const result of Object.values(scan)) {
        if (result && !result.isSolid) {
          continue
        }

        const checkNearby = tree.find(result, content.const.explorationNodeRadius)

        if (checkNearby) {
          continue
        }

        nodes.push(
          addNode({
            x: result.x,
            y: result.y,
            z: result.z,
          })
        )
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
  content.system.scan.on('recharge', (scan) => content.system.exploration.onScan(scan))
})

engine.state.on('export', (data) => data.exploration = content.system.exploration.export())
engine.state.on('import', (data) => content.system.exploration.import(data.exploration))
engine.state.on('reset', () => content.system.exploration.reset())
