content.treasures = (() => {
  const registry = new Map()

  const defaults = {
    name: 'Error',
    value: 0,
  }

  return {
    get: (key) => registry.get(key) || {...defaults},
    generate: function () {
      const time = Date.now() / 1000
      const srand = engine.utility.srand('treasure', time)

      const {generator, key} = engine.utility.chooseWeighted([...registry.values()], srand())

      return {
        key,
        time,
        uuid: engine.utility.uuid(),
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
