content.system.treasures.register('alien', 1, (srand) => {
  const names = [
    'Alien Black Box',
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
