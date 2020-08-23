content.system.audio.exploration = (() => {
  const props = new Set()

  return {
    addProp: function (prop) {
      props.add(prop)
      return this
    },
    removeProp: function (prop) {
      props.delete(prop)
      return this
    },
    reset: function () {
      props.clear()
      return this
    },
    update: function () {
      // TODO: Trigger props
      return this
    },
  }
})()

engine.loop.on('frame', ({frame, paused}) => {
  if (paused) {
    return
  }

  content.system.audio.exploration.update()
})

engine.state.on('reset', () => content.system.audio.exploration.reset())
