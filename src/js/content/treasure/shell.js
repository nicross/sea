content.system.treasure.archetypes.register('shell', 10, (srand) => {
  const adjectives = [
    {
      name: 'Chipped',
      modifier: (value) => value,
      weight: 2,
    },
    {
      name: 'Fossilized',
      modifier: (value) => value * 2,
      weight: 1,
    },
    {
      name: 'Partial',
      modifier: (value) => value * 0.5,
      weight: 3,
    },
  ]

  const animals = [
    {
      name: 'Barnacle',
      value: 2,
      weight: 3,
    },
    {
      name: 'Clam',
      value: 4,
      weight: 2,
    },
    {
      name: 'Mussel',
      value: 3,
      weight: 4,
    },
    {
      name: 'Nautilus',
      value: 10,
      weight: 1,
    },
    {
      name: 'Oyster',
      value: 5,
      weight: 2,
    },
    {
      name: 'Snail',
      value: 2,
      weight: 5,
    },
    {
      name: 'Turtle',
      value: 5,
      weight: 2,
    },
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    animal = engine.utility.chooseWeighted(animals, srand())

  return {
    name: `${adjective.name} ${animal.name} Shell`,
    value: adjective.modifier(animal.value),
  }
})
