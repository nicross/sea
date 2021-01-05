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

  function findClosest(query, radius = content.const.explorationEdgeRadius, count = content.const.explorationEdgeCount) {
    // TODO: Reimplement octree.find but with a distance heap and return array
    // SEE: https://stackoverflow.com/questions/2486093/millions-of-3d-points-how-to-find-the-10-of-them-closest-to-a-given-point
    return []
  }

  function updateGraph(nodes) {
    const changed = new Set()

    nodes.forEach((node) => {
      graph.set(node, new Set())
    })

    nodes.forEach((node) => {
      const closest = findClosest(node),
        edges = graph.get(node)

      closest.forEach((other) => {
        edges.add(other)
        graph.get(other).add(node)
      })
    })

    changed.forEach((node) => {
      const distances = [],
        edges = graph.get(node)

      edges.forEach((other) => {
        distances.push({
          distance: node.distance(other),
          node: other,
        })
      })

      distances.sort((a, b) => a.distance - b.distance)
      distances.slice(content.const.explorationEdgeCount).forEach(({node}) => edges.delete(node))
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
