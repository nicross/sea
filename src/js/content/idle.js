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

    const angularVelocity = content.movement.getAngularThrust(),
      velocity = content.movement.getLateralThrust()

    const isIdle = !angularVelocity && velocity.isZero()

    if (state == isIdle) {
      timer = state ? 0 : content.const.idleTimeout
      return
    }

    changed = true

    if (isIdle) {
      timer -= delta

      if (timer <= 0) {
        state = true
        timer = 0
        pubsub.emit('change', true)
      }

      return
    }

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
    touch: function () {
      if (state) {
        changed = true
        state = false
        timer = content.const.idleTimeout
        pubsub.emit('change', false)
      }

      return this
    },
  }, pubsub)
})()
