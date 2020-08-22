content.system.treasures.register('coin', 5, (srand) => {
  const adjectives = [
    {
      modifier: (value) => value * 5,
      name: 'Ancient',
      weight: 1,
    },
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
      modifier: (value) => value * 10,
      name: 'Rare',
      weight: 1,
    },
    {
      modifier: (value) => value * 0.5,
      name: 'Tarnished',
      weight: 2,
    },
  ]

  const materials = [
    {
      name: 'Stone',
      value: 1,
      weight: 7,
    },
    {
      name: 'Copper',
      value: 2,
      weight: 6,
    },
    {
      name: 'Bronze',
      value: 4,
      weight: 5,
    },
    {
      name: 'Iron',
      value: 6,
      weight: 4,
    },
    {
      name: 'Steel',
      value: 8,
      weight: 3,
    },
    {
      name: 'Silver',
      value: 10,
      weight: 2,
    },
    {
      name: 'Gold',
      value: 20,
      weight: 1,
    },
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    material = engine.utility.chooseWeighted(materials, srand())

  return {
    name: `${adjective.name} ${material.name} Coin`,
    value: adjective.modifier(material.value)
  }
})
