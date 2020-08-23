'use strict'

content.system.streamer = (() => {
  const registry = new Map(),
    registryTree = content.utility.octree.create(),
    streamed = new Map()

  let currentX,
    currentY,
    currentZ

  function createRegisteredProp(token) {
    const streamedProp = engine.streamer.prop.create(
      registry.get(token)
    )

    streamed.set(token, streamedProp)
  }

  function destroyStreamedProp(token) {
    if (!streamed.has(token)) {
      return
    }

    const streamedProp = streamed.get(token)

    streamedProp.destroy()
    streamed.delete(token)
  }

  function generateToken() {
    let token

    do {
      token = engine.utility.uuid()
    } while (registry.has(token))

    return token
  }

  function isWithinRadius(x, y, z) {
    return content.utility.distance(x, y, z, currentX, currentY, currentZ) <= engine.const.streamerRadius
  }

  return {
    deregisterProp: function(token) {
      const registeredProp = registry.get(token)

      if (!registeredProp) {
        return this
      }

      registry.delete(token)
      registryTree.delete(registeredProp)

      return this
    },
    registerProp: function(prototype, options = {}) {
      const token = generateToken()
      options.token = token

      const registeredProp = {
        options,
        prototype,
        token,
        x: options.x,
        y: options.y,
        z: options.z,
      }

      registry.set(token, registeredProp)
      registryTree.insert(registeredProp)

      if (isWithinRadius(options.x, options.y, options.z)) {
        createRegisteredProp(token)
      }

      return token
    },
    reset: function() {
      registry.clear()
      registryTree.clear()

      streamed.forEach((streamedProp) => streamedProp.destroy())
      streamed.clear()

      currentX = null
      currentY = null
      currentZ = null

      return this
    },
    update: (force = false) => {
      const position = engine.position.get(),
        positionX = Math.round(position.x),
        positionY = Math.round(position.y),
        positionZ = Math.round(content.system.z.get()),
        radius = engine.const.streamerRadius

      if (currentX === positionX && currentY === positionY && currentZ === positionZ && !force) {
        return this
      }

      currentX = positionX
      currentY = positionY
      currentZ = positionZ

      streamed.forEach((streamedProp, token) => {
        if (streamedProp.prop.distance > engine.const.streamerRadius) {
          destroyStreamedProp(token)
        }
      })

      registryTree.retrieve({
        depth: radius * 2,
        height: radius * 2,
        width: radius * 2,
        x: currentX - radius,
        y: currentY - radius,
        z: currentZ - radius,
      }).forEach(({token}) => {
        if (!streamed.has(token)) {
          createRegisteredProp(token)
        }
      })

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.streamer.update()
})

engine.state.on('reset', () => content.system.streamer.reset())
