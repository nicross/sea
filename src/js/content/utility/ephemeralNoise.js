// Manages memory of ephemeral noise by resetting them on fixed time intervals
content.utility.ephemeralNoise = (() => {
  const interval = 60,
    noises = []

  let timer

  engine.ready(resetTimer)

  function resetManaged() {
    for (const noise of noises) {
      noise.reset()
    }
  }

  function resetTimer() {
    timer = interval
  }

  return {
    manage: function (noise) {
      if (!noise || !noise.reset) {
        return this
      }

      noises.push(noise)

      return this
    },
    reset: function () {
      resetManaged()
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
