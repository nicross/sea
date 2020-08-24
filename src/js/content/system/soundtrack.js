content.system.soundtrack = (() => {
  // TODO

  return {
    reset: function () {
      return this
    },
  }
})()

engine.state.on('reset', () => content.system.soundtrack.reset())
