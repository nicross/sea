content.treasure = (() => {
  const chunkThreed = content.utility.threed.create(),
    chunkScale = 100,
    collected = [],
    collectedThreed = content.utility.threed.create(),
    pubsub = engine.utility.pubsub.create(),
    spawned = [],
    spawnedThreed = content.utility.threed.create(),
    tokens = new Set()

  function decrementSpawned({x, y, z}) {
    if (!spawnedThreed.has(x, y, z)) {
      return
    }

    const amount = spawnedThreed.get(x, y, z)
    spawnedThreed.set(x, y, z, Math.max(0, amount - 1))
  }

  function generateChunk(x, y, z) {
    const srand = engine.utility.srand('chunk', x, y, z)

    return {
      density: Math.round(srand() * 3),
      difficulty: srand(0.25, 0.5),
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

  function getTotalCollected({x, y, z}) {
    if (collectedThreed.has(x, y, z)) {
      return collectedThreed.get(x, y, z)
    }

    collectedThreed.set(x, y, z, 0)
    return 0
  }

  function getTotalSpawned({x, y, z}) {
    if (spawnedThreed.has(x, y, z)) {
      return spawnedThreed.get(x, y, z)
    }

    spawnedThreed.set(x, y, z, 0)
    return 0
  }

  function importCollected(items = []) {
    for (const item of items) {
      collected.push(item)

      incrementCollected({
        x: scale(item.x),
        y: scale(item.y),
        z: scale(item.z),
      })
    }
  }

  function importSpawned(items = []) {
    for (const item of items) {
      spawned.push(item)

      incrementSpawned({
        x: scale(item.x),
        y: scale(item.y),
        z: scale(item.z),
      })

      const token = engine.streamer.registerProp(content.prop.treasure, {
        destination: content.audio.mixer.bus.misc.bus(),
        radius: content.const.treasurePickupRadius,
        x: item.x,
        y: item.y,
        z: item.z,
      })

      tokens.add(token)
    }
  }

  function incrementCollected({x, y, z}) {
    if (!collectedThreed.has(x, y, z)) {
      return collectedThreed.set(x, y, z, 1)
    }

    const amount = collectedThreed.get(x, y, z)
    collectedThreed.set(x, y, z, amount + 1)
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
    ].filter((trace) => {
      return trace && trace.isSolid && (trace.distance > content.const.treasurePickupRadius * 2)
    }).sort((a, b) => b.distance - a.distance)

    // Bias towards farther scans, e.g. to prevent automatic acquisition
    const location = engine.utility.choose(locations, Math.random() ** 2)

    if (!location) {
      return
    }

    const token = engine.streamer.registerProp(content.prop.treasure, {
      destination: content.audio.mixer.bus.misc.bus(),
      radius: content.const.treasurePickupRadius,
      x: location.x,
      y: location.y,
      z: location.z,
    })

    tokens.add(token)
    incrementSpawned(chunk)

    spawned.push({
      x: location.x,
      y: location.y,
      z: location.z,
    })
  }

  return engine.utility.pubsub.decorate({
    any: () => [...collected, ...spawned],
    collect: function (prop) {
      const chunkCoordinates = {
        x: scale(prop.x),
        y: scale(prop.y),
        z: scale(prop.z),
      }

      decrementSpawned(chunkCoordinates)
      incrementCollected(chunkCoordinates)

      engine.streamer.deregisterProp(prop.token)
      engine.streamer.destroyStreamedProp(prop.token)
      tokens.delete(prop.token)

      const treasure = content.treasures.generate()

      treasure.x = prop.x
      treasure.y = prop.y
      treasure.z = prop.z

      // Remove from tracked spawns
      spawned.forEach((item, i) => {
        if (item.x == treasure.x && item.y == treasure.y && item.z == treasure.z) {
          spawned.splice(i, 1)
        }
      })

      collected.push(treasure)
      pubsub.emit('collect', treasure)

      return this
    },
    collected: () => [...collected],
    export: function () {
      return {
        collected: [...collected],
        spawned: [...spawned],
      }
    },
    getCurrentChunk: function () {
      const {x, y, z} = engine.position.getVector()
      return getChunk(x, y, z)
    },
    getCollected: () => [...collected],
    import: function (data = {}) {
      importCollected(data.collected || [])
      importSpawned(data.spawned || [])
      return this
    },
    onScan: function (scan) {
      // TODO: Improve this by rolling chunk for each individual scan point

      const {x, y, z} = engine.position.getVector()

      if (z > content.const.lightZone) {
        // Treasure absolutely will not spawn
        return
      }

      const floor = content.terrain.floor.value(x, y)

      if (scale(floor) < scale(z)) {
        // Current chunk is above closest possible spawn place
        return
      }

      const chunk = getChunk(x, y, z),
        isFirstScan = !collected.length && !spawned.length

      if (!isFirstScan) {
        const totalCollected = getTotalCollected(chunk)

        if (totalCollected >= chunk.density) {
          // All treasures have been collected
          return
        }

        const totalSpawned = getTotalSpawned(chunk)

        if ((totalCollected + totalSpawned) >= chunk.density) {
          // All treasures have been collected or spawned
          return
        }
      }

      if (!isFirstScan && Math.random() <= chunk.difficulty) {
        // Maybe next time
        return
      }

      spawnTreasure({
        chunk,
        scan,
      })
    },
    rebuildProps: function () {
      [...tokens].forEach((token) => {
        const {prototype, options} = engine.streamer.getRegisteredProp(token)

        engine.streamer.deregisterProp(token)
        engine.streamer.destroyStreamedProp(token)
        tokens.delete(token)

        let newToken = engine.streamer.registerProp(prototype, options)
        tokens.add(newToken)
      })

      return this
    },
    reset: function () {
      collected.length = 0
      spawned.length = 0
      tokens.clear()
      return this
    },
    spawned: () => [...spawned],
    test: function (count = 1) {
      const {x, y, z} = engine.position.getVector()

      for (let i = 0; i < count; i += 1) {
        const token = engine.streamer.registerProp(content.prop.treasure, {
          destination: content.audio.mixer.bus.misc.bus(),
          radius: content.const.treasurePickupRadius,
          x: x + engine.utility.random.float(-10, 10),
          y: y + engine.utility.random.float(-10, 10),
          z: z + engine.utility.random.float(-10, 10),
        })

        tokens.add(token)
      }

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.scan.on('recharge', (scan) => content.treasure.onScan(scan))
})

engine.state.on('export', (data) => data.treasure = content.treasure.export())
engine.state.on('import', (data) => content.treasure.import(data.treasure))
engine.state.on('reset', () => content.treasure.reset())
