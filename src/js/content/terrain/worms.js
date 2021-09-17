content.terrain.worms = (() => {
  const chunks = [],
    chunkSize = 1000,
    chunkTree = engine.utility.quadtree.create(),
    maxStreamRadius = 2,
    maxWormRadius = 16,
    pointTree = engine.utility.octree.create()

  const streamOffsets = []

  let isReady = false,
    isStreaming = false,
    readyChunk

  for (let x = -maxStreamRadius; x <= maxStreamRadius; x += 1) {
    for (let y = -maxStreamRadius; y <= maxStreamRadius; y += 1) {
      if (engine.utility.distance({x, y}) > maxStreamRadius) {
        continue
      }

      streamOffsets.push(
        engine.utility.vector2d.create({x, y})
      )
    }
  }

  streamOffsets.sort((a, b) => {
    // Sort by distance ascending
    return a.distance() - b.distance()
  })

  function createChunk(options) {
    const chunk = content.terrain.worms.chunk.create({
      size: chunkSize,
      ...options,
    })

    chunks.push(chunk)
    chunkTree.insert(chunk)

    return chunk.ready
  }

  function getChunk(x, y) {
    return chunkTree.find({x, y}, engine.const.zero)
  }

  function streamChunks() {
    try {
      const position = engine.position.getVector()

      const streamRadius = Math.round(
        engine.utility.lerp(0, maxStreamRadius,
          engine.utility.clamp(position.z / content.const.lightZone, 0, 1),
        )
      )

      const xi = Math.floor((position.x / chunkSize) + 0.5),
        yi = Math.floor((position.y / chunkSize) + 0.5)

      isStreaming = true

      for (const offset of streamOffsets) {
        if (offset.distance() > streamRadius) {
          continue
        }

        const x = xi + offset.x,
          y = yi + offset.y

        if (!getChunk(x, y)) {
          createChunk({x, y})
        }
      }

      isStreaming = false
    } catch (e) {
      // Handle content.utility.async.reset()
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
        searchRadius = maxWormRadius + radius

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
      isStreaming = false
      readyChunk = null

      chunks.length = 0
      chunkTree.clear()
      pointTree.clear()

      return this
    },
    retrieve: (...args) => pointTree.retrieve(...args),
    import: function () {
      streamChunks()
      readyChunk = chunks[0]

      readyChunk.ready.then(() => {
        if (chunks[0] === readyChunk) {
          isReady = true
        }
      }, () => {})

      return this
    },
    update: function () {
      if (!isStreaming) {
        streamChunks()
      }

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
