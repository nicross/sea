content.system.treasure.archetypes = (() => {
  const registry = new Map()

  const defaults = {
    name: 'Error',
    value: 0,
  }

  return {
    get: (key) => registry.get(key) || {...defaults},
    generate: function () {
      const time = Math.floor(Date.now() / 1000)
      const srand = engine.utility.srand('treasure', time)

      const {generator, key} = engine.utility.chooseWeighted([...registry.values()], srand())

      return {
        depth: content.system.z.get(),
        key,
        time,
        ...defaults,
        ...generator(srand),
      }
    },
    register: function (key, weight, generator) {
      registry.set(key, {
        generator,
        key,
        weight,
      })

      return this
    },
  }
})()

content.system.treasure.archetypes.register('alien', 1, (srand) => {
  const names = [
    'Alien Computational Device',
    'Alien Communications Device',
    'Alien Navigational Device',
    'Alien Translation Device',
    'Unknown Alien Technology',
  ]

  return {
    name: engine.utility.choose(names, srand()),
    value: 1000,
  }
})

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

content.system.treasure.archetypes.register('coin', 5, (srand) => {
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
