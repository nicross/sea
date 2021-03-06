app.controls.haptic = (() => {
  const defaultEffect = {
    duration: 0,
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: 0,
  }

  function getActuators() {
    const actuators = [],
      gamepads = navigator.getGamepads()

    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue
      }

      if (gamepad.vibrationActuator && gamepad.vibrationActuator.type == 'dual-rumble') {
        actuators.push(gamepad.vibrationActuator)
      }
    }

    return actuators
  }

  function isActive() {
    return app.settings.computed.gamepadVibration > 0
  }

  function trigger(effect) {
    const actuators = getActuators()

    effect = {...defaultEffect, ...effect}
    effect.strongMagnitude *= app.settings.computed.gamepadVibration
    effect.weakMagnitude *= app.settings.computed.gamepadVibration

    for (const actuator of actuators) {
      if (actuator.playEffect && actuator.type) {
        actuator.playEffect(actuator.type, effect)
      }
    }
  }

  return {
    getActuators,
    isActive,
    trigger: function (options = {}, force = false) {
      if (!force && engine.loop.isPaused()) {
        return this
      }

      if (isActive()) {
        trigger(options)
      }

      return this
    },
  }
})()

content.movement.on('surface-smack', ({
  gravity = 0,
  lateral = 0,
} = {}) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(50, 250, gravity * (1 - lateral), 2),
    startDelay: 0,
    strongMagnitude: gravity,
    weakMagnitude: 0,
  })
})

content.audio.surface.splash.on('grain', (strength = 0) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(25, 100, strength, 2),
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: strength,
  })
})

content.movement.on('transition-underwater', (velocity = 0) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(50, 200, velocity, 2),
    startDelay: 0,
    strongMagnitude: velocity,
    weakMagnitude: 0,
  })
})

content.movement.on('transition-surface', (velocity = 0) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(50, 200, velocity, 2),
    startDelay: 0,
    strongMagnitude: velocity,
    weakMagnitude: 0,
  })
})

content.movement.on('underwater-collision', ({
  ratio = 0,
} = {}) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerp(50, 250, ratio),
    startDelay: 0,
    strongMagnitude: ratio ** 0.5,
    weakMagnitude: ratio ** 3,
  })
})

content.scan.on('trigger', () => {
  app.controls.haptic.trigger({
    duration: 50,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  }, true)
})

content.scan.on('recharge', () => {
  if (engine.loop.isPaused()) {
    return
  }

  app.controls.haptic.trigger({
    duration: 50,
    startDelay: 0,
    strongMagnitude: 0.5,
    weakMagnitude: 0.5,
  })
})
