engine.const.movementDeceleration = engine.const.gravity
engine.const.movementMaxRotation = Math.PI / 2
engine.const.movementRotationalAcceleration = Math.PI
engine.const.movementRotationalDeceleration = engine.const.gravity

// NOTE: Max velocity and acceleration are handled via movement module, i.e. different movement models based on z-value

content.const = {
  lightZone: -1000,
  surfaceTurboAcceleration: 10,
  surfaceNormalAcceleration: 5,
  surfaceTurboMaxVelocity: 20,
  surfaceNormalMaxVelocity: 10,
  underwaterTurboAcceleration: 5,
  underwaterNormalAcceleration: 1,
  underwaterTurboMaxVelocity: 15,
  underwaterNormalMaxVelocity: 2,
  waveHeight: 4,
}
