content.system.treasure.spawner = (() => {
  const chunkThreed = content.utility.threed.create(),
    chunkScale = 100,
    foundThreed = content.utility.threed.create(),
    spawnedThreed = content.utility.threed.create()

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
    if (chunkThreed.has(x, y, z)) {
      return chunkThreed.get(x, y, z)
    }

    const chunk = generateChunk(x, y, z)
    chunkThreed.set(x, y, z, chunk)
    return chunk
  }

  function getFound({x, y, z}) {
    if (foundThreed.has(x, y, z)) {
      return foundThreed.get(x, y, z)
    }

    foundThreed.set(x, y, z, 0)
    return 0
  }

  function getSpawned({x, y, z}) {
    if (spawnedThreed.has(x, y, z)) {
      return spawnedThreed.get(x, y, z)
    }

    spawnedThreed.set(x, y, z, 0)
    return 0
  }

  function incrementFound({x, y, z}) {
    if (!foundThreed.has(x, y, z)) {
      return foundThreed.set(x, y, z, 1)
    }

    const amount = foundThreed.get(x, y, z)
    foundThreed.set(x, y, z, amount + 1)
  }

  function incrementSpawned({x, y, z}) {
    if (!spawnedThreed.has(x, y, z)) {
      return spawnedThreed.set(x, y, z, 1)
    }

    const amount = spawnedThreed.get(x, y, z)
    spawnedThreed.set(x, y, z, amount + 1)
  }

  function spawnTreasure({
    chunk,
    scan,
  }) {
    console.log('spawn treasure')

    // TODO: Spawn a treasure prop
    // Cheat by placing it randomly at a point or along the plane defined by scan, e.g.
    // forwardLeftDown forwardRightDown
    // reverseLeftDown reverseRightDown
    // And then raytrace to find closest non-solid surface (up if solid, down if not)

    incrementSpawned(chunk)
  }

  return {
    export: function (data = {}) {
      data.treasureFound = foundThreed.export()
      return data
    },
    getCurrentChunk: function () {
      let {x, y} = engine.position.get()
      let z = content.system.z.get()

      x = Math.floor(x / chunkScale)
      y = Math.floor(y / chunkScale)
      z = Math.floor(z / chunkScale)

      return getChunk(x, y, z)
    },
    import: function (data = {}) {
      foundThreed.import(data.treasureFound)
      return data
    },
    onScan: function (scan) {
      const z = content.system.z.get()

      if (z > content.const.lightZone) {
        // Treasure absolutely will not spawn
        return
      }

      const {x, y} = engine.position.get()
      const floor = content.system.terrain.floor.value(x, y)

      const scaledZ = Math.floor(z / chunkScale)

      if (Math.floor(floor / chunkScale) < scaledZ) {
        // Current chunk is above closest possible spawn place
        return
      }

      const scaledX = Math.floor(x / chunkScale),
        scaledY = Math.floor(y / chunkScale)

      const chunk = getChunk(scaledX, scaledY, scaledZ),
        found = getFound(chunk)

      console.log(chunk)

      if (found >= chunk.density) {
        // All treasure has been found
        return
      }

      const spawned = getSpawned(chunk)

      if ((found + spawned) >= chunk.density) {
        // All treasure has been spawned
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
  }
})()

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.scan.on('recharge', (scan) => content.system.treasure.spawner.onScan(scan))
})

engine.state.on('export', (data) => content.system.treasure.spawner.export(data))
engine.state.on('import', (data) => content.system.treasure.spawner.import(data))
