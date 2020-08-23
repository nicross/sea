engine.const.movementDeceleration = engine.const.gravity
engine.const.movementMaxRotation = Math.PI / 2
engine.const.movementRotationalAcceleration = Math.PI
engine.const.movementRotationalDeceleration = engine.const.gravity
engine.const.positionRadius = 0.5
engine.const.streamerRadius = 50

// NOTE: Max velocity and acceleration are handled via movement module, i.e. different movement models based on z-value

content.const = {
  dragDeceleration: 1,
  normalDeceleration: engine.const.gravity,
  lightZone: -1000,
  scanCooldown: 2 * 1000,
  surfaceNormalAcceleration: engine.const.gravity / 2,
  surfaceNormalMaxVelocity: 10,
  surfaceTurboAcceleration: engine.const.gravity,
  surfaceTurboMaxVelocity: 30,
  treasurePickupRadius: 2,
  underwaterNormalAcceleration: 1,
  underwaterNormalMaxVelocity: 2,
  underwaterSpeedOfSound: 1450,
  underwaterTurboAcceleration: engine.const.gravity,
  underwaterTurboMaxVelocity: 20,
  unit2: Math.sqrt(2) / 2,
  waveHeight: 8,
}
