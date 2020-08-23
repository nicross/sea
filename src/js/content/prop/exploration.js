content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  onConstruct: function () {
    // TODO: Implement real sound
    this.synth = engine.audio.synth.createSimple({
      gain: 1,
    }).connect(this.output.input)
  },
  onDestroy: function () {
    this.synth.stop()
  },
})
