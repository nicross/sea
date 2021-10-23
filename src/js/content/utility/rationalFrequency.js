content.utility.rationalFrequency = (() => {
  const intervals = [
    1,
    16/15,
    9/8,
    6/5,
    5/4,
    4/3,
    Math.sqrt(2),
    3/2,
    8/5,
    5/3,
    16/9,
    13/7,
    2
  ]

  const root = engine.utility.midiToFrequency(0)

  return {
    fromMidi: (note) => {
      const octave = Math.floor(note / 12)
      const coefficient = (2 ** octave) * intervals[note % 12]
      return root * coefficient
    },
  }
})()
