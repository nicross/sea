content.system.treasure.spawner = (() => {
  const chunks = new Map(),
    chunkScale = 100

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
    if (!chunks.has(x)) {
      chunks.set(x, new Map())
    }

    const chunkX = chunks.get(x)

    if (!chunkX.has(y)) {
      chunkX.set(y, new Map())
    }

    if (!chunkY.has(z)) {
      chunkY.set(z, generateChunk(x, y, z))
    }

    return chunkY.get(z)
  }

  function getRedeemed(x, y, z) {
    // TODO: Data structure that persists via engine.state / storage
    // Stores the number of treasure found in each chunk
    return 0
  }

  function getSpawned(x, y, z) {
    // TODO: Data structure that stores the number of treasure currently spawned
    return 0
  }

  function spawnTreasure({
    chunk,
    scan,
    x,
    y,
    z,
  }) {
    console.log('spawn treasure')
    // TODO: Spawn a treasure prop
    // Cheat by placing it randomly at a point or along the plane defined by scan, e.g.
    // forwardLeftDown forwardRightDown
    // reverseLeftDown reverseRightDown
    // And then raytrace to find closest non-solid surface (up if solid, down if not)
  }

  return {
    getCurrentChunk: function () {
      let {x, y} = engine.position.get()
      let z = content.system.z.get()

      x = Math.floor(x / chunkScale)
      y = Math.floor(y / chunkScale)
      z = Math.floor(z / chunkScale)

      return getChunk(x, y, z)
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

      const chunk = getChunk(scaledX, scaledY, scaledZ)

      if (getRedeemed(scaledX, scaledY, scaledZ) >= chunk.density) {
        // All treasure has been found
        return
      }

      if (getSpawned(scaledX, scaledY, scaledZ) >= chunk.density) {
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
        x,
        y,
        z,
      })
    },
  }
})()
