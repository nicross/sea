content.scan = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isCooldown = false

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

      for (const stream of results.scan2d) {
        for (const result of stream) {
          if (result.isWorm) {
            results.scan3d.push(result)
          }
        }
      }

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
