content.prop.base = engine.prop.base.invent((prototype) => ({
  construct: function ({
    destination = engine.audio.mixer.bus.props(),
    radius = this.radius || 0,
    token,
    x = 0,
    y = 0,
    z = 0,
    ...options
  } = {}) {
    // Copied but without reverb
    const context = engine.audio.context()

    this.destination = destination
    this.instantiated = true
    this.periodic = {}
    this.radius = radius
    this.spawnAngle = this.angle
    this.token = token
    this.x = x
    this.y = y
    this.z = z

    this.binaural = engine.audio.binaural.create()
    this.output = context.createGain()

    this.binaural.from(this.output)
    this.binaural.to(destination)

    this.output.gain.value = engine.const.zeroGain
    engine.audio.ramp.linear(this.output.gain, 1, engine.const.propFadeDuration)

    engine.utility.physical.decorate(this)

    this.recalculate()
    this.onConstruct(options)

    return this
  },
  destroy: function () {
    // Copied but without reverb
    engine.audio.ramp.linear(this.output.gain, engine.const.zeroGain, engine.const.propFadeDuration)

    setTimeout(() => {
      this.output.disconnect()
      this.binaural.destroy()
      this.onDestroy()
    }, engine.const.propFadeDuration * 1000)

    return this
  },
  rebuildBinaural: function () {
    this.binaural.destroy()

    this.binaural = engine.audio.binaural.create()
    this.binaural.from(this.output)
    this.binaural.to(this.destination)

    this.recalculate()

    return this
  },
  recalculate: function () {
    // Copied but without reverb
    const positionQuaternion = engine.position.getQuaternion(),
      positionVector = engine.position.getVector()

    this.updatePhysics()

    this.relative = this.vector()
      .subtract(positionVector)
      .subtractRadius(this.radius)
      .rotateQuaternion(positionQuaternion.conjugate())

    this.distance = this.relative.distance()

    this.binaural.update({...this.relative})

    return this
  },
}))
