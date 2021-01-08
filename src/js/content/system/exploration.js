content.system.exploration = (() => {
  const graph = new Map(),
    list = [],
    tree = engine.utility.octree.create()

  function addNode(node) {
    const vector = engine.utility.vector3d.create(node)

    list.push(vector)
    tree.insert(vector)

    engine.streamer.registerProp(content.prop.exploration, {
      destination: content.system.audio.underwater.music.bus(),
      x: node.x,
      y: node.y,
      z: node.z,
    })

    return vector
  }

  function findClosest(target) {
    const distance2s = new Map(),
      radius2 = ((content.const.explorationEdgeRadius * (Math.sqrt(3) / 3)) ** 2) * 3

    let nodes = tree.retrieve({
      ...target,
      depth: content.const.explorationEdgeRadius,
      height: content.const.explorationEdgeRadius,
      width: content.const.explorationEdgeRadius,
    })

    nodes.filter((node) => {
      if (node === target) {
        return false
      }

      const distance2 = node.distance2(target)
      distance2s.set(node, distance2)

      return distance2 <= radius2
    })

    nodes.sort((a, b) => {
      return distance2s.get(b) - distance2s.get(a)
    })

    return nodes.slice(0, content.const.explorationEdgeCount)
  }

  function updateGraph(nodes) {
    const added = new Set([...nodes]),
      changed = new Set()

    nodes.forEach((node) => {
      graph.set(node, new Set())
    })

    nodes.forEach((node) => {
      const closest = findClosest(node),
        edges = graph.get(node)

      closest.forEach((other) => {
        edges.add(other)

        if (!added.has(node)) {
          changed.add(other)
        }
      })
    })

    changed.forEach((node) => {
      const closest = findClosest(node),
        edges = graph.get(node)

      edges.clear()

      closest.forEach((other) => {
        edges.add(other)
      })
    })
  }

  return {
    export: () => [...list],
    find: (...args) => tree.find(...args),
    graph: () => graph,
    import: function (values = []) {
      const nodes = values.map(addNode)
      updateGraph(nodes)
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

      updateGraph(nodes)

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
