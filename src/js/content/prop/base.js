content.prop.base = engine.prop.base.invent((prototype) => ({
  construct: function ({
    angle = 0,
    output = engine.audio.mixer.bus.props(),
    token = '',
    radius = 0,
    x = 0,
    y = 0,
    z = 0,
    ...options
  } = {}) {
    // Copied but with added token and z values
    const context = engine.audio.context()

    this.acceleration = 0
    this.accelerationDelta = 0
    this.angle = angle
    this.angleDelta = 0
    this.jerk = 0
    this.jerkDelta = 0
    this.periodic = {}
    this.radius = radius
    this.shouldCull = false
    this.spawnAngle = this.angle
    this.spawnX = x
    this.spawnY = y
    this.token = token
    this.velocity = 0
    this.velocityDelta = 0
    this.willCull = false
    this.x = x
    this.y = y
    this.z = z

    this.output = {
      binaural: engine.audio.binaural.create(),
      input: context.createGain(),
      reverb: engine.audio.send.reverb.create(),
    }

    this.output.binaural.from(this.output.input)
    this.output.binaural.to(output)

    this.output.reverb.from(this.output.input)

    this.output.input.gain.value = engine.const.zeroGain
    engine.audio.ramp.linear(this.output.input.gain, 1, engine.const.propFadeDuration)

    this.recalculate()
    this.onConstruct(options)

    return this
  },
  recalculate: function (delta = 0) {
    // Copied but with added z compensation
    const position = engine.position.get(),
      relative = engine.utility.toRelativeCoordinates(position, this),
      z = content.system.z.get(),
      zFactor = 1 + (Math.abs(z - this.z) ** 0.5)

    this.atan2 = Math.atan2(this.y - position.y, this.x - position.x)
    this.distance = content.utility.distanceRadius(position.x, position.y, z, this.x, this.y, this.z, this.radius)

    // Multiply vector by z-factor to stretch its apparent distance
    relative.x *= zFactor
    relative.y *= zFactor

    this.output.binaural.update({
      delta,
      ...relative,
    })

    this.output.reverb.update({
      delta,
      ...relative,
    })

    return this
  },
  rect: function () {
    // Copied but with added z value
    return {
      depth: this.radius * 2,
      height: this.radius * 2,
      width: this.radius * 2,
      x: this.x - this.radius,
      y: this.y - this.radius,
      y: this.z - this.radius,
    }
  },
}))
