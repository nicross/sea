content.const = {
  airAngularDeceleration: Math.PI / 16,
  airDeceleration: 0,
  dayDuration: 30 * 60,
  ephemeralNoiseTimer: 60,
  explorationNodeRadius: 1,
  idleTimeout: 10,
  lightZone: -1000,
  midnightZoneMin: -750,
  midnightZoneMax: -1250,
  normalAngularDeceleration: 2 * Math.PI,
  normalDeceleration: engine.const.gravity,
  propLimit: 30,
  scanCooldown: 2 * 1000,
  surfaceNormalAcceleration: 4,
  surfaceNormalMaxVelocity: 10,
  surfaceTurboAcceleration: engine.const.gravity,
  surfaceTurboMaxVelocity: 40,
  treasurePickupRadius: 5,
  underwaterNormalAcceleration: 2,
  underwaterNormalMaxVelocity: 5,
  underwaterSpeedOfSound: 1450,
  underwaterTurboAcceleration: engine.const.gravity,
  underwaterTurboMaxVelocity: 20,
  unit2: Math.sqrt(2) / 2,
  waveHeightMax: 16,
  waveHeightMin: 4,
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
