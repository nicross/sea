'use strict'

content.system.streamer = (() => {
  const registry = new Map(),
    registryTree = content.utility.octree.create(),
    streamed = new Map()

  let currentX,
    currentY,
    currentZ,
    shouldForce = false

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
      registryTree.remove(registeredProp)

      return this
    },
    destroyStreamedProp: function (token) {
      destroyStreamedProp(token)
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

      shouldForce = true

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
      shouldForce = false

      return this
    },
    update: (force = false) => {
      const position = engine.position.get(),
        positionX = Math.round(position.x),
        positionY = Math.round(position.y),
        positionZ = Math.round(content.system.z.get()),
        radius = engine.const.streamerRadius

      if (!force && !shouldForce && currentX === positionX && currentY === positionY && currentZ === positionZ) {
        return this
      }

      currentX = positionX
      currentY = positionY
      currentZ = positionZ
      shouldForce = false

      const nowStreaming = new Set()

      const props = registryTree.retrieve({
        depth: radius * 2,
        height: radius * 2,
        width: radius * 2,
        x: currentX - radius,
        y: currentY - radius,
        z: currentZ - radius,
      }).map((prop) => ({
        distance: content.utility.distance2(positionX, positionY, positionZ, prop.x, prop.y, prop.z),
        ...prop,
      })).sort((a, b) => {
        if (a.prototype == content.prop.treasure) {
          return -1
        }

        if (b.prototype == content.prop.treasure) {
          return 1
        }

        return a.distance - b.distance
      }).slice(0, content.const.propLimit)

      for (const {token} of props) {
        if (!streamed.has(token)) {
          createRegisteredProp(token)
        }
        nowStreaming.add(token)
      }

      for (const token of streamed.keys()) {
        if (!nowStreaming.has(token)) {
          destroyStreamedProp(token)
        }
      }

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
