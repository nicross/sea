content.scan = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isCooldown = false

  function mergeWorms(results) {
    results.wormEntrances = []
    results.worms = []

    // Optimization: Ignore when scanning surface
    if (!results.isFloor) {
      return
    }

    const maxDistance = content.scan.scan3d.maxDistance(),
      position = engine.position.getVector(),
      wormEntrances = [],
      worms = new Set(),
      worms2d = new Set()

    // Collect worms scanned in 3D
    for (const result of results.scan3d) {
      if (result.isWorm) {
        worms.add(result.worm)
      }
    }

    // Collect worms scanned in 2D
    // Transform their entrances (closest point intersecting floor) into 3D scan results
    for (const stream of results.scan2d) {
      for (const result of stream) {
        if (!result.isWormEntrance || worms2d.has(result.worm)) {
          continue
        }

        const distance = position.distance(result.wormPoint)

        if (distance > maxDistance) {
          continue
        }

        worms.add(result.worm)
        worms2d.add(result.worm)

        wormEntrances.push({
          ...result,
          distance,
          distanceRatio: distance / maxDistance,
          relativeZ: result.wormPoint.z - position.z,
          remember: false,
          x: result.wormPoint.x,
          y: result.wormPoint.y,
          z: result.wormPoint.z,
        })
      }
    }

    results.scan3d.push(...wormEntrances)
    results.wormEntrances = wormEntrances
    results.worms = [...worms]
  }

  return engine.utility.pubsub.decorate({
    benchmark: async function () {
      const start = performance.now()
      await this.triggerForward()
      return performance.now() - start
    },
    isCooldown: () => isCooldown,
    triggerForward: async function () {
      if (isCooldown) {
        return this
      }

      const trigger = {
        isFloor: content.utility.altimeter.isCloserToFloor(),
        isForward: true,
        isReverse: false,
        isSurface: content.utility.altimeter.isCloserToSurface(),
      }

      isCooldown = true
      pubsub.emit('trigger', {...trigger})

      const minimum = engine.utility.timing.promise(content.const.scanMinimum * 1000)

      const results = {
        ...trigger,
        scan2d: await this.scan2d.forward(),
        scan3d: await this.scan3d.forward(),
      }

      mergeWorms(results)

      await minimum
      pubsub.emit('complete', results)

      engine.utility.timing.promise(content.const.scanCooldown * 1000).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
    triggerReverse: async function () {
      if (isCooldown) {
        return this
      }

      const trigger = {
        isFloor: content.utility.altimeter.isCloserToFloor(),
        isForward: false,
        isReverse: true,
        isSurface: content.utility.altimeter.isCloserToSurface(),
      }

      isCooldown = true
      pubsub.emit('trigger', {...trigger})

      const minimum = engine.utility.timing.promise(content.const.scanMinimum * 1000)

      const results = {
        ...trigger,
        scan2d: await this.scan2d.reverse(),
        scan3d: await this.scan3d.reverse(),
      }

      mergeWorms(results)

      await minimum
      pubsub.emit('complete', results)

      engine.utility.timing.promise(content.const.scanCooldown * 1000).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
  }, pubsub)
})()

content.scan.on('trigger', () => {
  engine.loop.pause()
})

content.scan.on('recharge', () => {
  if (app.state.game.is('running')) {
    engine.loop.resume()
  }
})
