content.soundtrack = (() => {
  const root = 45

  const chords = [
    [-9, -5, -2],
    [-5, -2, 2],
    [-4, 0, 3],
    [-2, 2, 5],
    [0, 3, 7],
    [3, 7, 10],
    [7, 10, 14],
    [8, 12, 15],
    [10, 14, 17],
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

  const chordField = engine.utility.simplex3d.create('soundtrack', 'chord'),
    chordMomentum = 7,
    chordScale = 1000 / engine.utility.simplex3d.prototype.skewFactor,
    chordTimeScale = 300 / engine.utility.simplex3d.prototype.skewFactor

  const inversionField = engine.utility.simplex3d.create('soundtrack', 'inversion'),
    inversionMomentum = 11,
    inversionScale = 1000 / engine.utility.simplex3d.prototype.skewFactor,
    inversionTimeScale = 300 / engine.utility.simplex3d.prototype.skewFactor

  let frequencies = [],
    harmonics = []

  content.utility.ephemeralNoise
    .manage(chordField)
    .manage(inversionField)

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
      const position = engine.position.getVector()

      const present = {
        time: (data.time || {}).time || 0,
        x: position.x,
        y: position.y,
        z: position.z,
      }

      updateFrequencies(present)
      updateHarmonics()

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
        time: content.time.value(),
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

  content.soundtrack.update()
})

engine.state.on('import', (data) => content.soundtrack.import(data))
