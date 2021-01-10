content.system.treasures.register('toy', 3, (srand) => {
  const adjectives = [
    {
      name: 'Broken',
      modifier: (value) => value,
      weight: 4,
    },
    {
      name: 'Encrusted',
      modifier: (value) => value * 0.5,
      weight: 4,
    },
    {
      name: 'Collectible',
      modifier: (value) => value * 5,
      weight: 1,
    },
  ]

  const types = [
    {
      name: 'Action Figure',
      value: 50,
      weight: 1,
    },
    {
      name: 'Doll',
      value: 50,
      weight: 1,
    },
    {
      name: 'Snowglobe',
      value: 40,
      weight: 1,
    },
    {
      name: 'Toy Alien',
      value: 100,
      weight: 1,
    },
    {
      name: 'Toy Animal',
      value: 10,
      weight: 2,
    },
    {
      name: 'Toy Boat',
      value: 4,
      weight: 3,
    },
    {
      name: 'Toy Car',
      value: 4,
      weight: 3,
    },
    {
      name: 'Toy Dinosaur',
      value: 20,
      weight: 2,
    },
    {
      name: 'Toy Piano',
      value: 40,
      weight: 1,
    },
    {
      name: 'Toy Rocket',
      value: 80,
      weight: 1,
    },
    {
      name: 'Toy Soldier',
      value: 2,
      weight: 6,
    },
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    type = engine.utility.chooseWeighted(types, srand())

  return {
    name: `${adjective.name} ${type.name}`,
    value: adjective.modifier(type.value)
  }
})
