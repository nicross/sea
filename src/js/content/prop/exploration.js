content.prop.exploration = content.prop.base.invent({
  name: 'Exploration Node',
  onConstruct: function () {
    content.system.audio.exploration.addProp(this)
  },
  onDestroy: function () {
    content.system.audio.exploration.removeProp(this)
  },
  trigger: function (frequency) {
    // TODO: Build synth
    // TODO: Find further optimizations, like only updating binaural while triggering
  },
})
