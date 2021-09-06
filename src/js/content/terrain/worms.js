content.terrain.worms = (() => {
  const chunks = [],
    chunkSize = 500,
    chunkTree = engine.utility.quadtree.create(),
    maxRadius = 10,
    pointTree = engine.utility.octree.create()

  let isReady = false

  function createChunk(options) {
    const chunk = content.terrain.worms.chunk.create({
      size: chunkSize,
      ...options,
    })

    chunks.push(chunk)
    chunkTree.insert(chunk)
  }

  function getChunk(x, y) {
    return chunkTree.find({x, y}, engine.const.zero)
  }

  function streamChunks() {
    const position = engine.position.getVector()

    const streamRadius = Math.round(
      engine.utility.lerp(0, 5,
        engine.utility.clamp(position.z / content.const.lightZone, 0, 1),
      )
    )

    const xi = Math.floor(position.x / chunkSize),
      yi = Math.floor(position.y / chunkSize)

    for (let x = xi - streamRadius; x <= xi + streamRadius; x += 1) {
      for (let y = yi - streamRadius; y <= yi + streamRadius; y += 1) {
        if (!getChunk(x, y)) {
          createChunk({x, y})
        }
      }
    }
  }

  return {
    addPoint: function (point) {
      pointTree.insert(point)

      return this
    },
    chunks: () => [...chunks],
    find: (...args) => pointTree.find(...args),
    isInside: function (x, y, z, radius = engine.const.zero) {
      const from = engine.utility.vector3d.create({x, y, z}),
        searchRadius = maxRadius + radius

      const points = pointTree.retrieve({
        depth: 2 * searchRadius,
        height: 2 * searchRadius,
        width: 2 * searchRadius,
        x: from.x - searchRadius,
        y: from.y - searchRadius,
        z: from.z - searchRadius,
      })

      for (const point of points) {
        if (from.distance(point) <= (point.radius + radius)) {
          return true
        }
      }

      return false
    },
    isReady: () => isReady,
    reset: function () {
      isReady = false

      chunkTree.clear()
      pointTree.clear()

      return this
    },
    retrieve: (...args) => pointTree.retrieve(...args),
    import: function () {
      streamChunks()

      Promise.all(
        chunks.map((chunk) => chunk.ready)
      ).then(() => {
        isReady = true
      })

      return this
    },
    update: function () {
      streamChunks()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.terrain.worms.update()
})

engine.state.on('import', () => content.terrain.worms.import())
engine.state.on('reset', () => content.terrain.worms.reset())
