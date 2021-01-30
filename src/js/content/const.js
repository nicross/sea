content.const = {
  airRotationalDeceleration: 0,
  airAngularDeceleration: 1,
  explorationNodeRadius: 1,
  idleTimeout: 10,
  lightZone: -1000,
  midnightZoneMin: -750,
  midnightZoneMax: -1250,
  normalAngularDeceleration: engine.const.gravity,
  normalDeceleration: engine.const.gravity,
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

engine.const.distancePower = 1.25
engine.const.positionRadius = 0.5
engine.prop.base.fadeInDuration = 1/16
engine.prop.base.fadeOutDuration = 1/16

engine.streamer.setSort((a, b) => {
  if (content.prop.treasure.isPrototypeOf(a)) {
    return -1
  }

  if (content.prop.treasure.isPrototypeOf(b)) {
    return 1
  }

  return a.distance - b.distance
})
