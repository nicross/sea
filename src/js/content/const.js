content.const = {
  airAngularDeceleration: Math.PI / 16,
  airDeceleration: 0,
  dayDuration: 30 * 60,
  ephemeralNoiseTimer: 60,
  idleTimeout: 8,
  lightZone: -1000,
  midnightZoneMin: -750,
  midnightZoneMax: -1250,
  normalAngularDeceleration: 2 * Math.PI,
  normalDeceleration: 10,
  normalSpeedOfSound: 343,
  scanCooldown: 2.5,
  scanMinimum: 0.5,
  surfaceNormalAcceleration: 5,
  surfaceNormalMaxVelocity: 10,
  surfaceTurboAcceleration: 10,
  surfaceTurboMaxVelocity: 40,
  treasurePickupRadius: 5,
  underwaterNormalAcceleration: 5,
  underwaterNormalMaxVelocity: 10,
  underwaterSpeedOfSound: 1450,
  underwaterTurboAcceleration: 10,
  underwaterTurboMaxVelocity: 20,
  unit2: Math.sqrt(2) / 2,
  waveHeightMax: 16,
  waveHeightMin: 4,
}

engine.const.distancePower = 1.25
engine.const.positionRadius = 0.5

engine.streamer.setSort((a, b) => {
  if (content.prop.treasure.isPrototypeOf(a)) {
    return -1
  }

  if (content.prop.treasure.isPrototypeOf(b)) {
    return 1
  }

  return a.distance - b.distance
})
