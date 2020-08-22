content.system.treasure.archetypes.register('bone', 10, (srand) => {
  const adjectives = [
    {
      name: 'Chipped',
      modifier: (value) => value,
      weight: 2,
    },
    {
      name: 'Partial',
      modifier: (value) => value * 0.5,
      weight: 3,
    },
    {
      name: 'Fossilized',
      modifier: (value) => value * 2,
      weight: 1,
    },
  ]

  const animals = [
    {
      name: 'Human',
      value: 1,
      weight: 1,
    },
    {
      name: 'Icthyosaur',
      value: 6,
      weight: 2,
    },
    {
      name: 'Megalodon',
      value: 10,
      weight: 1,
    },
    {
      name: 'Plesiosaur',
      value: 6,
      weight: 2,
    },
    {
      name: 'Pterosaur',
      value: 5,
      weight: 1,
    },
    {
      name: 'Orca',
      value: 3,
      weight: 2,
    },
    {
      name: 'Turtle',
      value: 2,
      weight: 2,
    },
    {
      name: 'Whale',
      value: 4,
      weight: 2,
    },
  ]

  const types = [
    {
      modifier: (value) => value * 4,
      name: 'Femur',
      weight: 3,
    },
    {
      modifier: (value) => value * 4,
      name: 'Humerus',
      weight: 3,
    },
    {
      modifier: (value) => value * 3,
      name: 'Jawbone',
      weight: 2,
    },
    {
      modifier: (value) => value * 2,
      name: 'Rib',
      weight: 3,
    },
    {
      modifier: (value) => value * 10,
      name: 'Skull',
      weight: 1,
    },
    {
      modifier: (value) => value,
      name: 'Tooth',
      weight: 5,
    },
    {
      modifier: (value) => value,
      name: 'Vertibrae',
      weight: 5,
    },
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    animal = engine.utility.chooseWeighted(animals, srand()),
    type = engine.utility.chooseWeighted(types, srand())

  return {
    name: `${adjective.name} ${animal.name} ${type.name}`,
    value: adjective.modifier(type.modifier(animal.value)),
  }
})
