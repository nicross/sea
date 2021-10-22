content.scan = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isCooldown = false

  function mergeResults({
    scan2d,
    scan3d,
  } = {}) {
    const maxDistance = content.scan.scan3d.maxDistance(),
      position = engine.position.getVector(),
      worms2d = [],
      worms2dResults = []

    const hasWorm = (worm) => worms2d.includes(worm)

    for (const stream of scan2d) {
      for (const result of stream) {
        if (result.isWormEntrance && !hasWorm(result.worm)) {
          const distance = position.distance(result.wormPoint)

          if (distance > maxDistance) {
            continue
          }

          worms2d.push(result.worm)

          worms2dResults.push({
            ...result,
            distance,
            distanceRatio: distance / maxDistance,
            relativeZ: result.wormPoint.z - position.z,
            x: result.wormPoint.x,
            y: result.wormPoint.y,
            z: result.wormPoint.z,
          })
        }
      }
    }

    scan3d.push(...worms2dResults)
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

      isCooldown = true
      pubsub.emit('trigger', {forward: true})

      const minimum = engine.utility.timing.promise(content.const.scanMinimum * 1000)

      const results = {
        scan2d: await this.scan2d.forward(),
        scan3d: await this.scan3d.forward(),
      }

      mergeResults(results)

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

      isCooldown = true
      pubsub.emit('trigger', {reverse: true})

      const minimum = engine.utility.timing.promise(content.const.scanMinimum * 1000)

      const results = {
        scan2d: await this.scan2d.reverse(),
        scan3d: await this.scan3d.reverse(),
      }

      mergeResults(results)

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
