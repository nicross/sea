content.system.treasure.archetypes.register('trash', 20, (srand) => {
  const adjectives = [
    {
      name: 'Damaged',
      modifier: (value) => value,
      weight: 4,
    },
    {
      name: 'Encrusted',
      modifier: (value) => value,
      weight: 4,
    },
    {
      name: 'Pristine',
      modifier: (value) => value * 2,
      weight: 1,
    },
  ]

  const types = [
    'Baseball',
    'Bottle',
    'Camera',
    'Cigar Box',
    'Cinder Block',
    'Clock',
    'Flask',
    'Fork',
    'Globe',
    'Hammer',
    'Jar',
    'Journal',
    'Kettle',
    'Knife',
    'Lamp',
    'Lighter',
    'Mop',
    'Plate',
    'Pocketwatch',
    'Pot',
    'Screwdriver',
    'Snowglobe',
    'Shoe',
    'Spoon',
    'Telescope',
    'Tire',
    'Toy',
    'Umbrella',
    'Wrench',
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    type = engine.utility.choose(types, srand())

  return {
    name: `${adjective.name} ${type}`,
    value: adjective.modifier(1)
  }
})

content.system.treasure.archetypes.register('uxo', 5, (srand) => {
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
      name: 'Pristine',
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
