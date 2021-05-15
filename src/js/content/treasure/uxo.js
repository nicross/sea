content.treasures.register('uxo', 5, (srand) => {
  const adjectives = [
    {
      modifier: (value) => value * 0.5,
      name: 'Corroded',
      weight: 2,
    },
    {
      modifier: (value) => value * 0.5,
      name: 'Encrusted',
      weight: 2,
    },
    {
      modifier: (value) => value,
      name: 'Polished',
      weight: 1,
    },
    {
      modifier: (value) => value * 0.5,
      name: 'Rusty',
      weight: 2,
    },
  ]

  const sides = [
    'Allied',
    'Axis',
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    side = engine.utility.choose(sides, srand())

  return {
    name: `${adjective.name} ${side} UXO`,
    value: adjective.modifier(100)
  }
})
