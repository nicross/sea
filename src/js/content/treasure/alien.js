content.treasures.register('alien', 2, (srand) => {
  const names = [
    'Alien Artifact',
    'Alien Black Box',
    'Alien Computational Device',
    'Alien Communications Device',
    'Alien Exoskeleton',
    'Alien Navigational Device',
    'Alien Propulsion Device',
    'Alien Translation Device',
    'Unknown Alien Technology',
  ]

  return {
    name: engine.utility.choose(names, srand()),
    value: 1000,
  }
})
