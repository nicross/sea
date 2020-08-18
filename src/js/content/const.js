engine.const.movementDeceleration = engine.const.gravity
engine.const.movementMaxRotation = Math.PI / 2
engine.const.movementRotationalAcceleration = Math.PI
engine.const.movementRotationalDeceleration = engine.const.gravity

// NOTE: Max velocity and acceleration are handled via movement module, i.e. different movement models based on z-value

content.const = {
  dragDeceleration: 1,
  normalDeceleration: engine.const.gravity,
  lightZone: -1000,
  surfaceTurboAcceleration: engine.const.gravity,
  surfaceNormalAcceleration: engine.const.gravity / 2,
  surfaceTurboMaxVelocity: 30,
  surfaceNormalMaxVelocity: 10,
  underwaterTurboAcceleration: engine.const.gravity,
  underwaterNormalAcceleration: 1,
  underwaterTurboMaxVelocity: 20,
  underwaterNormalMaxVelocity: 2,
  waveHeight: 8,
}
