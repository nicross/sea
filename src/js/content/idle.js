content.idle = (() => {
  const pubsub = engine.utility.pubsub.create()

  let changed,
    state,
    timer

  engine.loop.on('frame', ({delta, paused}) => {
    if (changed) {
      changed = false
    }

    if (paused) {
      return
    }

    const angularVelocity = engine.position.getAngularVelocity(),
      velocity = engine.position.getVelocity()

    const isIdle = angularVelocity.equals() && velocity.equals()

    if (state == isIdle) {
      timer = state ? 0 : content.const.idleTimeout
      return
    }

    if (isIdle) {
      timer -= delta

      if (timer <= 0) {
        state = true
        timer = 0
        pubsub.emit('change', true)
      }

      return
    }

    changed = true
    state = false
    timer = content.const.idleTimeout
    pubsub.emit('change', false)
  })

  engine.state.on('reset', () => {
    changed = false
    state = true
    timer = content.const.idleTimeout
  })

  return engine.utility.pubsub.decorate({
    changed: () => changed,
    is: () => state,
    timer: () => timer,
  }, pubsub)
})()
