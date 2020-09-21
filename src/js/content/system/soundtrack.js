content.system.soundtrack = (() => {
  const root = 45

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

  const multiples = [
    1.5,
    2,
    3,
    4,
    6,
    8,
  ]

  const chordField = engine.utility.perlin3d.create('soundtrack', 'chord'),
    chordMomentum = 7,
    chordScale = 1000,
    chordTimeScale = 300

  const inversionField = engine.utility.perlin3d.create('soundtrack', 'inversion'),
    inversionMomentum = 11,
    inversionScale = 1000,
    inversionTimeScale = 300

  let frequencies = [],
    harmonics = []

  function getChord(present) {
    let x = present.x / chordScale
    x += present.time * chordMomentum / chordScale

    let y = present.z / chordScale
    y += present.time * chordMomentum / chordScale

    let z = present.time / chordTimeScale

    return engine.utility.choose(chords, chordField.value(x, y, z))
  }

  function getInversion(present) {
    let x = present.y / inversionScale
    x += present.time * inversionMomentum / inversionScale

    let y = present.z / inversionScale
    y += present.time * inversionMomentum / inversionScale

    let z = present.time / inversionTimeScale

    return engine.utility.choose(inversions, inversionField.value(x, y, z))
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

  function updateHarmonics() {
    harmonics.length = 0

    for (const frequency of frequencies) {
      for (const multiple of multiples) {
        harmonics.push(frequency * multiple)
      }
    }

    harmonics = harmonics.sort((a, b) => a - b)
  }

  return {
    frequencies: () => [...frequencies],
    harmonics: () => [...harmonics],
    import: function (data) {
      const position = data.position || {}

      const present = {
        time: data.time || 0,
        x: position.x || 0,
        y: position.y || 0,
        z: data.z || 0,
      }

      updateFrequencies(present)
      updateHarmonics()

      return this
    },
    reset: function () {
      // TODO: Reset fields
      return this
    },
    update: function () {
      // TODO: Possibly a frame limiter

      const {x, y, z} = engine.position.getVector()

      if (z > content.const.midnightZoneMin + 1) {
        // Don't waste frames when not audible
        // Some leeway to prevent race conditions
        return this
      }

      const present = {
        time: content.system.time.get(),
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

engine.state.on('import', (data) => content.system.soundtrack.import(data))
engine.state.on('reset', () => content.system.soundtrack.reset())
