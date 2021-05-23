content.audio.surface.splash = (() => {
  const bus = content.audio.mixer.bus.environment.createBus(),
    context = engine.audio.context(),
    filter = context.createBiquadFilter(),
    pubsub = engine.utility.pubsub.create(),
    throttleRate = 1000/20

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-9)
  filter.connect(bus)

  function grain() {
    const velocity = humanize(engine.position.getVelocity()),
      yaw = Math.abs(engine.position.getAngularVelocityEuler().yaw)

    const strength = toStrength(velocity, yaw)

    const direction = velocity.normalize().rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    const carrierGain = engine.utility.random.float(1/2, 2/3),
      duration = engine.utility.lerpRandom([1/4, 3/4], [1/2, 1], strength),
      gain = engine.utility.random.float(1/2, 1)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.white(),
      carrierGain,
      modDepth: 1 - carrierGain,
      modFrequency: engine.utility.lerpRandom([4, 8], [10, 20], strength),
    }).filtered({
      frequency: engine.utility.lerpRandom([200, 400], [600, 1000], strength),
    })

    const binaural = engine.audio.binaural.create(direction)
      .from(synth.output)
      .to(bus)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)

    pubsub.emit('grain', strength)
    throttle = performance.now()
  }

  function humanize(vector, scale = 3/4) {
    vector.x *= 1 + engine.utility.random.float(-scale, scale)
    vector.y *= 1 + engine.utility.random.float(-scale, scale)
    vector.z *= 1 + engine.utility.random.float(-scale, scale)
    return vector
  }

  function rollGrain() {
    if (performance.now() < throttle + throttleRate) {
      return false
    }

    if (!content.movement.isSurface()) {
      return false
    }

    const velocity = engine.position.getVelocity(),
      yaw = Math.abs(engine.position.getAngularVelocityEuler().yaw)

    if (engine.utility.round(velocity.distance() + yaw, 3) <= 0) {
      return false
    }

    const fps = Math.max(engine.performance.fps(), 1),
      strength = toStrength(velocity, yaw)

    const chance = engine.utility.lerp(1/fps, 1/(fps/8), strength)

    return Math.random() < chance
  }

  function toStrength(velocity, yaw) {
    const velocityRatio = (velocity.distance() / content.const.surfaceTurboMaxVelocity) ** 0.75,
      yawRatio = yaw / content.movement.getAngularMaxVelocity() / 16

    return engine.utility.clamp(velocityRatio + yawRatio, 0, 1)
  }

  return engine.utility.pubsub.decorate({
    import: function () {
      if (content.movement.isUnderwater()) {
        this.underwater()
      } else {
        this.surface()
      }

      return this
    },
    surface: function () {
      engine.audio.ramp.exponential(filter.frequency, engine.const.maxFrequency, 1/8)
      return this
    },
    underwater: function () {
      engine.audio.ramp.exponential(filter.frequency, 200, 1/8)
      return this
    },
    update: function (e) {
      if (rollGrain()) {
        grain()
      }

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.movement.on('transition-surface', () => content.audio.surface.splash.surface())
  content.movement.on('transition-underwater', () => content.audio.surface.splash.underwater())
})

engine.loop.on('frame', () => content.audio.surface.splash.update())
engine.state.on('import', () => content.audio.surface.splash.import())
