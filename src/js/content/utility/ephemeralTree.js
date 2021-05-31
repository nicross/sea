// Manages memory of ephemeral trees by resetting them on fixed time intervals
content.utility.ephemeralTree = (() => {
  const interval = 300,
    trees = []

  let timer

  engine.ready(resetTimer)

  function clearManaged() {
    for (const tree of trees) {
      tree.clear()
    }
  }

  function resetTimer() {
    timer = interval
  }

  return {
    manage: function (tree) {
      if (!tree || !tree.clear) {
        return this
      }

      trees.push(tree)

      return this
    },
    reset: function () {
      clearManaged()
      resetTimer()
      return this
    },
    update: function (delta) {
      timer -= delta

      if (timer <= 0) {
        this.reset()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  content.utility.ephemeralNoise.update(delta)
})

engine.state.on('reset', () => content.utility.ephemeralNoise.reset())
