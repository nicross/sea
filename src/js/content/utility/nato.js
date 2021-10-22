content.utility.nato = (() => {
  const alphabet = [
    'Alpha',
    'Bravo',
    'Charlie',
    'Delta',
    'Echo',
    'Foxtrot',
    'Golf',
    'Hotel',
    'India',
    'Juliet',
    'Kilo',
    'Lima',
    'Mike',
    'November',
    'Oscar',
    'Papa',
    'Quebec',
    'Romeo',
    'Sierra',
    'Tango',
    'Uniform',
    'Victor',
    'Whiskey',
    'X-ray',
    'Yankee',
    'Zulu',
  ]

  return {
    alphabet: () => [...alphabet],
    fromNumber: (value) => {
      // 16074 -> Whiskey Tango Foxtrot

      const base = alphabet.length,
        result = []

      while (value > 0) {
        const index = Math.max(0, value % base - 1)
        result.unshift(alphabet[index])
        value = Math.floor(value / base)
      }

      return result.join(' ')
    },
  }
})()
