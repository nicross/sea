content.prop.treasure = content.prop.base.invent({
  name: 'Treasure',
  onConstruct: function () {
    const context = engine.audio.context()

    this.filter = context.createBiquadFilter()
    this.filter.frequency.value = engine.const.minFrequency
    this.filter.connect(this.output.input)

    content.system.audio.treasure.add(this)
    content.system.audio.treasure.output().connect(this.filter)
  },
  onDestroy: function () {
    content.system.audio.treasure.remove(this)
    content.system.audio.treasure.output().disconnect(this.filter)
  },
  onUpdate: function () {
    if (this.isCollected) {
      return this
    }

    if (this.distance <= 0) {
      return this.collect()
    }

    // TODO: Adjust a filter based on heading/proximity
    // SEE: exploration node glitter
    engine.audio.ramp.set(this.filter.frequency, engine.const.maxFrequency)
  },
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.input.gain, engine.const.zeroGain, 1/4)
    content.system.treasure.collect(this)
    return this
  },
})
