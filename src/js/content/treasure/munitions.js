content.treasures.register('munitions', 5, (srand) => {
  const adjectives = [
    {
      modifier: 0.5,
      name: 'Corroded',
      weight: 1,
    },
    {
      modifier: 0.5,
      name: 'Encrusted',
      weight: 1,
    },
    {
      modifier: 1,
      name: 'Polished',
      weight: 1,
    },
    {
      modifier: 0.5,
      name: 'Rusty',
      weight: 1,
    },
    {
      modifier: 0.5,
      name: 'Spent',
      weight: 1,
    },
  ]

  const nouns = [
    {
      name: 'Ammunition',
      value: 24,
      weight: 3,
    },
    {
      name: 'Equipment',
      value: 20,
      weight: 3,
    },
    {
      name: 'Rations',
      value: 12,
      weight: 4,
    },
    {
      name: 'UXO',
      value: 100,
      weight: 1,
    },
    {
      name: 'Weapon',
      value: 48,
      weight: 2,
    },
  ]

  const sides = [
    {
      modifier: 1,
      name: 'Allied',
      weight: 2,
    },
    {
      modifier: 1,
      name: 'Axis',
      weight: 2,
    },
    {
      modifier: 2,
      name: 'Resistance',
      weight: 1,
    },
  ]

  const adjective = engine.utility.chooseWeighted(adjectives, srand()),
    noun = engine.utility.chooseWeighted(nouns, srand()),
    side = engine.utility.chooseWeighted(sides, srand())

  return {
    name: `${adjective.name} ${side.name} ${noun.name}`,
    value: noun.value * adjective.modifier * side.modifier
  }
})
