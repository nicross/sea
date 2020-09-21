content.system.exploration = (() => {
  const list = [],
    tree = content.utility.octree.create()

  function addNode(node) {
    list.push(node)
    tree.insert(node)

    content.system.streamer.registerProp(content.prop.exploration, {
      output: content.system.audio.underwater.music.bus(),
      x: node.x,
      y: node.y,
      z: node.z,
    })
  }

  return {
    export: () => [...list],
    import: function (nodess = []) {
      for (const nodes of nodess) {
        addNode(nodes)
      }
      return this
    },
    onScan: function (scan) {
      for (const result of Object.values(scan)) {
        if (result && !result.isSolid) {
          continue
        }

        const checkNearby = tree.find(result, content.const.explorationNodeRadius)

        if (checkNearby) {
          continue
        }

        addNode({
          x: result.x,
          y: result.y,
          z: result.z,
        })
      }

      return this
    },
    reset: function () {
      list.length = 0
      tree.clear()
      return this
    },
  }
})()

engine.ready(() => {
  content.system.scan.on('recharge', (scan) => content.system.exploration.onScan(scan))
})

engine.state.on('export', (data) => data.exploration = content.system.exploration.export())
engine.state.on('import', (data) => content.system.exploration.import(data.exploration))
engine.state.on('reset', () => content.system.exploration.reset())
