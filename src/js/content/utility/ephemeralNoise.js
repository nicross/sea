// Manages memory of ephemeral noise by resetting them on fixed time intervals
content.utility.ephemeralNoise = (() => {
  const noises = []

  let timer

  engine.ready(resetTimer)

  function decorate(noise) {
    noise.prune = returnSelf
    noise.requestPrune = returnSelf
  }

  function returnSelf() {
    return this
  }

  function resetManaged() {
    for (const noise of noises) {
      noise.reset()
    }
  }

  function resetTimer() {
    timer = content.const.ephemeralNoiseTimer
  }

  return {
    manage: function (noise) {
      if (!noise || !noise.reset) {
        return this
      }

      noises.push(noise)

      if (noise.perlin) {
        noise.perlin.forEach(decorate)
      } else {
        decorate(noise)
      }

      return this
    },
    reset: function () {
      resetTimer()

      for (const noise of noises) {
        noise.reset()
      }

      return this
    },
    update: function (delta) {
      timer -= delta

      if (timer <= 0) {
        resetManaged()
        resetTimer()
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
