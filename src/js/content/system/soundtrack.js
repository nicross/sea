content.system.soundtrack = (() => {
  const root = 33

  const chords = [
    [-4, 0, 3],
    [-2, 2, 5],
    [0, 3, 7],
    [3, 7, 10],
    [7, 10, 14],
  ]

  const inversions = [
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, -1],
    [0, -1, -1],
  ]

  // TODO: Define fields

  let frequencies = [],
    harmonics = []

  function getChord({time, x, y, z}) {
    // TODO: Leverage fields
    return chords[2]
  }

  function getColor({time, x, y, z}) {
    // TODO: Leverage fields
    return 8
  }

  function getInversion({time, x, y, z}) {
    // TODO: Leverage fields
    return inversions[2]
  }

  function updateFrequencies(present) {
    const chord = getChord(present),
      inversion = getInversion(present)

    frequencies = [
      engine.utility.midiToFrequency(root + chord[0] + (inversion[0] * 12)),
      engine.utility.midiToFrequency(root + chord[1] + (inversion[1] * 12)),
      engine.utility.midiToFrequency(root + chord[2] + (inversion[2] * 12)),
    ].sort((a, b) => a - b)
  }

  function updateHarmonics(present) {
    const color = getColor(present)

    harmonics.length = 0

    for (let i = 2; i <= color; i += 1) {
      for (const frequency of frequencies) {
        harmonics.push(frequency * i)
      }
    }
  }

  return {
    frequencies: () => [...frequencies],
    harmonics: () => [...harmonics],
    reset: function () {
      // TODO: Reset fields
      return this
    },
    update: function () {
      // TODO: Possibly a frame limiter

      const {x, y} = engine.position.get()

      const time = content.system.time.get(),
        z = content.system.z.get()

      const present = {
        time,
        x,
        y,
        z,
      }

      updateFrequencies(present)
      updateHarmonics(present)

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.soundtrack.update()
})

engine.state.on('reset', () => content.system.soundtrack.reset())
