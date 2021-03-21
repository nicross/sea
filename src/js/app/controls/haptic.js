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
    trigger: function (...args) {
      if (isActive()) {
        trigger(...args)
      }

      return this
    },
  }
})()

content.system.movement.on('surface-smack', ({
  gravity = 0,
  lateral = 0,
} = {}) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(25, 250, gravity * (1 - lateral), 2),
    startDelay: 0,
    strongMagnitude: gravity,
    weakMagnitude: 0,
  })
})

content.system.movement.on('surface-splash', ({
  size = 0,
  velocity = 0,
} = {}) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(25, 100, size, 2),
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: velocity * Math.random(),
  })
})

content.system.movement.on('underwater-collision', ({
  ratio = 0,
} = {}) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerp(25, 250, ratio),
    startDelay: 0,
    strongMagnitude: ratio ** 0.5,
    weakMagnitude: ratio ** 3,
  })
})

content.system.scan.on('trigger', () => {
  app.controls.haptic.trigger({
    duration: 75,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})
