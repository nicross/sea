app.fastTravel = (() => {
  const pubsub = engine.utility.pubsub.create()

  const types = {
    floor: toFloor,
    origin: toOrigin,
    surface: toSurface,
    worm: toWorm,
  }

  function calculateTravelTime(destination) {
    const position = engine.position.getVector()

    const directUnderwater = engine.utility.distance(position, destination) / content.const.underwaterTurboMaxVelocity,
      positionToSurface = Math.max(0, -position.z) / content.const.underwaterTurboMaxVelocity,
      surfaceTime = engine.utility.distance({...position, z: 0}, {...destination, z: 0}) / content.const.surfaceTurboMaxVelocity,
      surfaceToDestination = Math.max(0, destination.z) / content.const.underwaterTurboMaxVelocity

    return Math.min(...[
      directUnderwater, // best for short distances
      positionToSurface + surfaceTime + surfaceToDestination, // best for long distances
    ])
  }

  function toFloor(destination) {
    const position = engine.position.getVector()
    const velocity = content.const.underwaterTurboMaxVelocity

    // Stop slightly above floor
    const stoppingDistance = content.utility.accelerate.stoppingDistance(velocity, content.const.normalDeceleration) + 4

    const next = engine.utility.vector3d.create({
      x: destination.x,
      y: destination.y,
      z: destination.z + stoppingDistance,
    })

    const distance = next.distance(position),
      travelTime = distance / velocity

    return {
      next,
      travelTime,
      velocity: engine.utility.vector3d.unitZ().scale(-velocity),
    }
  }

  function toOrigin(destination) {
    const velocity = content.const.underwaterTurboMaxVelocity
    const stoppingDistance = content.utility.accelerate.stoppingDistance(velocity, content.const.normalDeceleration)

    const next = engine.utility.vector3d.create({
      x: destination.x,
      y: destination.y,
      z: destination.z - stoppingDistance,
    })

    return {
      next,
      velocity: engine.utility.vector3d.unitZ().scale(velocity),
    }
  }

  function toSurface(destination) {
    const velocity = content.const.underwaterTurboMaxVelocity

    // Jump slightly out from water
    const stoppingDistance = content.utility.accelerate.stoppingDistance(velocity, content.const.normalDeceleration) - 4

    const next = engine.utility.vector3d.create({
      x: destination.x,
      y: destination.y,
      z: destination.z - stoppingDistance,
    })

    return {
      next,
      velocity: engine.utility.vector3d.unitZ().scale(velocity),
    }
  }

  function toWorm(destination) {
    const position = engine.position.getVector()
    const velocity = content.const.underwaterTurboMaxVelocity
    const stoppingDistance = content.utility.accelerate.stoppingDistance(velocity, content.const.normalDeceleration)

    const next = engine.utility.vector3d.create({
      x: destination.x,
      y: destination.y,
      z: destination.z + stoppingDistance,
    })

    const distance = next.distance(position),
      travelTime = distance / velocity

    return {
      next,
      travelTime,
      velocity: engine.utility.vector3d.unitZ().scale(-velocity),
    }
  }

  return engine.utility.pubsub.decorate({
    goto: function (destination) {
      const travelTime = calculateTravelTime(destination)

      const {
        next,
        velocity,
      } = types[destination.type](destination)

      engine.position.setVector(next)

      content.movement.reset().import()
      engine.position.setVelocity(velocity)

      content.time.incrementOffset(travelTime)

      // TODO: Refactor to listen for travel event
      app.canvas.crossfade()
      app.canvas.camera.reset()
      app.stats.fastTravels.increment()

      pubsub.emit('travel', destination)

      return this
    },
  }, pubsub)
})()

app.ready(() => {
  app.state.screen.on('before-fastTravel-select', (destination) => app.fastTravel.goto(destination))
})
