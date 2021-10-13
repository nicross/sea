content.prop.treasure = content.prop.base.invent({
  name: 'Treasure',
  fadeInDuration: 1/8,
  fadeOutDuration: 1/8,
  onConstruct: function () {
    const context = engine.audio.context()

    this.harmonyGain = context.createGain()
    this.harmonyGain.gain.value = this.calculateHarmonyGain()
    this.harmonyGain.connect(this.output)

    content.audio.underwater.treasure.add(this)
    this.buildFilters()
  },
  onDestroy: function () {
    content.audio.underwater.treasure.remove(this)
    this.destroyFilters()
  },
  onUpdate: function () {
    if (this.isCollected) {
      return this
    }

    if (engine.utility.round(this.distance, 3) <= 0) {
      return this.collect()
    }

    engine.audio.ramp.set(this.harmonyFilter.frequency, this.calculateHarmonyFilterFrequency())
    engine.audio.ramp.set(this.harmonyGain.gain, this.calculateHarmonyGain())
    engine.audio.ramp.set(this.melodyFilter.frequency, this.calculateMelodyFilterFrequency())
  },
  buildFilters: function () {
    const context = engine.audio.context()

    this.harmonyFilter = context.createBiquadFilter()
    this.harmonyFilter.frequency.value = this.calculateHarmonyFilterFrequency()
    this.harmonyFilter.Q.value = 1/4
    this.harmonyFilter.type = 'bandpass'

    content.audio.underwater.treasure.harmonyOutput().connect(this.harmonyFilter)
    this.harmonyFilter.connect(this.harmonyGain)

    this.melodyFilter = context.createBiquadFilter()
    this.melodyFilter.frequency.value = this.calculateMelodyFilterFrequency()

    content.audio.underwater.treasure.melodyOutput().connect(this.melodyFilter)
    this.melodyFilter.connect(this.output)

    return this
  },
  calculateHarmonyFilterFrequency: function () {
    const angle = this.relative.euler().pitch,
      frequency = content.audio.underwater.treasure.getHarmonyFrequency(),
      ratio = engine.utility.scale(Math.sin(angle) || 0, -1, 1, 0, 1)

    return ratio > 0.5
      ? frequency * 256
      : frequency * 8
  },
  calculateHarmonyGain: function () {
    return engine.utility.clamp(Math.abs(this.relative.z) / this.radius, 0, 1)
  },
  calculateMelodyFilterFrequency: function () {
    const angle = this.relative.euler().yaw

    let ratio = engine.utility.scale(Math.cos(angle) || 0, -1, 1, 0, 1)

    if (this.checkOcclusion()) {
      ratio /= 3
    }

    return content.audio.underwater.treasure.getMelodyFrequency() * engine.utility.lerp(1, 8, ratio)
  },
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/4)
    content.treasure.collect(this)
    return this
  },
  destroyFilters: function () {
    try {
      content.audio.underwater.treasure.harmonyOutput().disconnect(this.harmonyFilter)
      content.audio.underwater.treasure.melodyOutput().disconnect(this.melodyFilter)
    } catch (e) {}

    return this
  },
  troubleshoot: function () {
    // XXX: Last resort fix for biquad filter issues
    return this.destroyFilters().buildFilters().rebuildBinaural()
  },
})
