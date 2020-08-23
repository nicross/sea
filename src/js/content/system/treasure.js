content.system.treasure = (() => {
  const chunkThreed = content.utility.threed.create(),
    chunkScale = 100,
    collectedThreed = content.utility.threed.create(),
    pubsub = engine.utility.pubsub.create(),
    spawnedThreed = content.utility.threed.create()

  let collectedTotal = 0

  function decrementSpawned({x, y, z}) {
    if (!spawnedThreed.has(x, y, z)) {
      return
    }

    const amount = spawnedThreed.get(x, y, z)
    spawnedThreed.set(x, y, z, Math.max(0, amount - 1))
  }

  function generateChunk(x, y, z) {
    const srand = engine.utility.srand('chunk', x, y, z)

    // TODO: Possibly a modifier value for different archetypes
    return {
      density: Math.round((srand() ** 2) * 3),
      difficulty: srand(0.25, 0.75),
      x,
      y,
      z,
    }
  }

  function getChunk(x, y, z) {
    x = scale(x)
    y = scale(y)
    z = scale(z)

    if (chunkThreed.has(x, y, z)) {
      return chunkThreed.get(x, y, z)
    }

    const chunk = generateChunk(x, y, z)
    chunkThreed.set(x, y, z, chunk)
    return chunk
  }

  function getCollected({x, y, z}) {
    if (collectedThreed.has(x, y, z)) {
      return collectedThreed.get(x, y, z)
    }

    collectedThreed.set(x, y, z, 0)
    return 0
  }

  function getSpawned({x, y, z}) {
    if (spawnedThreed.has(x, y, z)) {
      return spawnedThreed.get(x, y, z)
    }

    spawnedThreed.set(x, y, z, 0)
    return 0
  }

  function incrementCollected({x, y, z}) {
    if (!collectedThreed.has(x, y, z)) {
      return collectedThreed.set(x, y, z, 1)
    }

    const amount = collectedThreed.get(x, y, z)
    collectedThreed.set(x, y, z, amount + 1)

    collectedTotal += 1
  }

  function incrementSpawned({x, y, z}) {
    if (!spawnedThreed.has(x, y, z)) {
      return spawnedThreed.set(x, y, z, 1)
    }

    const amount = spawnedThreed.get(x, y, z)
    spawnedThreed.set(x, y, z, amount + 1)
  }

  function scale(value) {
    return Math.floor(value / chunkScale)
  }

  function spawnTreasure({
    chunk,
    scan,
  }) {
    // Use scan results for possible locations
    // Sort locations by distance descending to prevent
    const locations = [
      scan.down,
      scan.forward,
      scan.forwardLeftDown,
      scan.forwardRightDown,
      scan.left,
      scan.reverse,
      scan.reverseLeftDown,
      scan.reverseRightDown,
      scan.right,
    ].filter((trace) => trace && trace.isSolid).sort((a, b) => b.distance - a.distance)

    // Bias towards farther scans, e.g. to prevent automatic acquisition
    const location = engine.utility.choose(locations, Math.random() ** 2)

    if (!location) {
      return
    }

    console.log(location)

    content.system.streamer.registerProp(content.prop.treasure, {
      radius: 1,
      x: location.x,
      y: location.y,
      z: location.z,
    })

    /*
      TODO: Better placement, e.g. randomly along the faces defined by scan, e.g.
      treat 3-4 solid points as a 2d surface and shoot a ray through for solid point
    */

    incrementSpawned(chunk)
  }

  return engine.utility.pubsub.decorate({
    collect: function (prop) {
      const chunkCoordinates = {
        x: scale(prop.x),
        y: scale(prop.y),
        z: scale(prop.z),
      }

      content.system.streamer.deregisterProp(prop.token)
      content.system.streamer.destroyStreamedProp(prop.token)

      incrementCollected(chunkCoordinates)
      decrementSpawned(chunkCoordinates)

      const treasure = content.system.treasures.generate()

      // TODO: Add to gallery
      // TODO: Emit event, e.g. for autosaving and sound cue

      pubsub.emit('collect', treasure)

      return this
    },
    export: function () {
      return {
        collected: {
          threed: collectedThreed.export(),
          total: collectedTotal,
        },
      }
    },
    getCurrentChunk: function () {
      const {x, y} = engine.position.get()
      const z = content.system.z.get()
      return getChunk(x, y, z)
    },
    getTotalCollected: () => collectedTotal,
    import: function (data = {}) {
      const dataCollected = data.collected || {}

      collectedThreed.import(dataCollected.threed)
      collectedTotal = Number(dataCollected.total) || 0

      return this
    },
    onScan: function (scan) {
      const z = content.system.z.get()

      if (z > content.const.lightZone) {
        // Treasure absolutely will not spawn
        return
      }

      const {x, y} = engine.position.get()
      const floor = content.system.terrain.floor.value(x, y)

      if (scale(floor) < scale(z)) {
        // Current chunk is above closest possible spawn place
        return
      }

      const chunk = getChunk(x, y, z),
        collected = getCollected(chunk)

      if (collected >= chunk.density) {
        // All treasures have been collected
        return
      }

      const spawned = getSpawned(chunk)

      if ((collected + spawned) >= chunk.density) {
        // All treasures have been spawned
        return
      }

      if (Math.random() <= chunk.difficulty) {
        // Maybe next time
        return
      }

      spawnTreasure({
        chunk,
        scan,
      })
    },
  }, pubsub)
})()

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.scan.on('recharge', (scan) => content.system.treasure.onScan(scan))
})

engine.state.on('export', (data) => data.treasure = content.system.treasure.export())
engine.state.on('import', (data) => content.system.treasure.import(data.treasure))
