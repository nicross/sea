content.system.treasures.register('dogtag', 5, (srand) => {
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
      modifier: (value) => value * 0.5,
      name: 'Rusty',
      weight: 2,
    },
    {
      modifier: (value) => value,
      name: 'Spotless',
      weight: 1,
    },
  ]

  const surnames = [
    'Anderson',
    'Brown',
    'Chavez',
    'Clark',
    'Davis',
    'Harris',
    'Hernandez',
    'Garcia',
    'Gonzalez',
    'Jackson',
    'Johnson',
    'Jones',
    'Kim',
    'Lee',
    'Liu',
    'Lopez',
    'Martinez',
    'Moralez',
    'Miller',
    'Nguyen',
    'Olson',
    'Park',
    'Perez',
    'Ramirez',
    'Robinson',
    'Rodriguez',
    'Sanchez',
    'Smith',
    'Sullivan',
    'Thomas',
    'Wilson',
    'Williams',
    'Wong',
    'Yun',
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    surname = engine.utility.choose(surnames, srand())

  return {
    name: `${adjective.name} Dogtag (${surname})`,
    value: adjective.modifier(10)
  }
})
