content.system.treasure.archetypes.register('dogtag', 5, (srand) => {
  const adjectives = [
    {
      modifier: (value) => value * 0.75,
      name: 'Chipped',
      weight: 2,
    },
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
      name: 'Pristine',
      weight: 1,
    },
    {
      modifier: (value) => value * 0.5,
      name: 'Rusty',
      weight: 2,
    },
  ]

  const surnames = [
    'Anderson',
    'Brown',
    'Chavez',
    'Hernandez',
    'Garcia',
    'Johnson',
    'Jones',
    'Kim',
    'Lee',
    'Lopez',
    'Martinez',
    'Miller',
    'Olson',
    'Rodriguez',
    'Smith',
    'Sullivan',
    'Williams',
    'Wong',
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    surname = engine.utility.choose(surnames, srand())

  return {
    name: `${adjective.name} Dogtag (${surname})`,
    value: adjective.modifier(10)
  }
})
