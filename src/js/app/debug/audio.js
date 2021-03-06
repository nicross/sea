'use strict'

app.debug.audio = (() => {
  const context = engine.audio.context(),
    createBufferSource = context.createBufferSource,
    createConstantSource = context.createConstantSource,
    createOscillator = context.createOscillator,
    data = new Map()

  context.createBufferSource = function () {
    const node = createBufferSource.apply(context, arguments),
      stop = node.stop,
      uuid = add()

    node.stop = function () {
      remove(uuid)
      stop.apply(node, arguments)
    }

    return node
  }

  context.createConstantSource = function () {
    const node = createConstantSource.apply(context, arguments),
      stop = node.stop,
      uuid = add()

    node.stop = function () {
      remove(uuid)
      stop.apply(node, arguments)
    }

    return node
  }

  context.createOscillator = function () {
    const node = createOscillator.apply(context, arguments),
      stop = node.stop,
      uuid = add()

    node.stop = function () {
      remove(uuid)
      stop.apply(node, arguments)
    }

    return node
  }

  function add() {
    const key = engine.utility.uuid()

    const trace = {}
    Error.captureStackTrace(trace, add)
    data.set(key, trace.stack)

    return key
  }

  function remove(uuid) {
    data.delete(uuid)
  }

  return {
    get: () => [...data.values()],
    length: () => data.size,
  }
})()
