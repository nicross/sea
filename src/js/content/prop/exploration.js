content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  onConstruct: function () {
    // TODO: Implement real sound, e.g. periodic glitter, possibly via a service that loops through all nodes and tells them what notes to play (e.g. for performance and a cool effect)
    this.synth = engine.audio.synth.createSimple({
      frequency: engine.utility.random.float(220, 440),
      gain: 0.25,
    }).connect(this.output.input)

    content.system.audio.exploration.addProp(this)
  },
  onDestroy: function () {
    content.system.audio.exploration.removeProp(this)
    this.synth.stop()
  },
  trigger: function (frequency) {
    // TODO: Build synth
  },
})
