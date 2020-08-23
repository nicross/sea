content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  onConstruct: function () {
    // TODO: Implement real sound, e.g. periodic glitter, possibly via a service that loops through all nodes and tells them what notes to play (e.g. for performance and a cool effect)
    this.synth = engine.audio.synth.createSimple({
      frequency: engine.utility.random.float(220, 440),
      gain: 1,
    }).connect(this.output.input)
  },
  onDestroy: function () {
    this.synth.stop()
  },
})
