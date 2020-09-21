engine.const.distancePower = 1.25
engine.const.positionRadius = 0.5
engine.const.propFadeDuration = 1/16

// NOTE: Max velocity and acceleration are handled via movement module, i.e. different movement models based on z-value

content.const = {
  dragDeceleration: 1,
  dragRotationalDeceleration: 0,
  explorationNodeRadius: 1,
  lightZone: -1000,
  midnightZoneMin: -750,
  midnightZoneMax: -1250,
  movementDeceleration: engine.const.gravity,
  movementMaxRotation: Math.PI / 2,
  movementRotationalAcceleration: Math.PI,
  normalDeceleration: engine.const.gravity,
  normalRotationalDeceleration: engine.const.gravity,
  propLimit: 30,
  scanCooldown: 2 * 1000,
  surfaceNormalAcceleration: 4,
  surfaceNormalMaxVelocity: 4,
  surfaceTurboAcceleration: engine.const.gravity,
  surfaceTurboMaxVelocity: 40,
  treasurePickupRadius: 5,
  underwaterNormalAcceleration: 2,
  underwaterNormalMaxVelocity: 4,
  underwaterSpeedOfSound: 1450,
  underwaterTurboAcceleration: engine.const.gravity,
  underwaterTurboMaxVelocity: 20,
  unit2: Math.sqrt(2) / 2,
  waveHeight: 8,
}

engine.streamer.setLimit(30).setRadius(50).setSort((a, b) => {
  if (content.prop.treasure.isPrototypeOf(a)) {
    return -1
  }

  if (content.prop.treasure.isPrototypeOf(b)) {
    return 1
  }

  return a.distance - b.distance
})
