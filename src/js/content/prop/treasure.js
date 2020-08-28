content.prop.treasure = content.prop.base.invent({
  name: 'Treasure',
  onConstruct: function () {
    content.system.audio.treasure.add(this)
    this.buildFilter()
  },
  onDestroy: function () {
    content.system.audio.treasure.remove(this)
    this.destroyFilter()
  },
  onUpdate: function () {
    if (this.isCollected) {
      return this
    }

    if (this.distance <= 0) {
      return this.collect()
    }

    this.filter.frequency.value = this.calculateFilterFrequency()
  },
  buildFilter: function () {
    const context = engine.audio.context()

    this.filter = context.createBiquadFilter()
    this.filter.frequency.value = this.calculateFilterFrequency()

    content.system.audio.treasure.output().connect(this.filter)
    this.filter.connect(this.output.input)

    return this
  },
  calculateFilterFrequency: function () {
    const {angle} = engine.position.get()
    const distanceRatio = Math.max(0, 1 - (this.distance / engine.const.streamerRadius)),
      facingRatio = engine.utility.scale(Math.cos(this.atan2 - angle), -1, 1, 0, 1)

    const color = engine.utility.lerp(1, 8, engine.utility.clamp(distanceRatio * facingRatio, 0, 1))

    return color * content.system.audio.treasure.getFrequency()
  },
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.input.gain, engine.const.zeroGain, 1/4)
    content.system.treasure.collect(this)
    return this
  },
  destroyFilter: function () {
    this.filter.disconnect()

    try {
      content.system.audio.treasure.output().disconnect(this.filter)
    } catch (e) {}

    return this
  },
  troubleshoot: function () {
    // XXX: Last resort fix for biquad filter issues
    return this.destroyFilter().buildFilter().rebuildBinaural()
  },
})
