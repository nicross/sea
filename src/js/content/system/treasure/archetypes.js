content.system.treasure.archetypes = (() => {
  const defaultKey = 'error',
    registry = new Map()

  const defaults = {
    name: 'Error',
    value: 0,
  }

  registry.set(defaultKey, () => ({...defaults}))

  return {
    get: (key) => registry.get(key) || registry.get(defaultKey),
    generate: function () {
      const time = Math.floor(Date.now() / 1000)
      const srand = engine.utility.srand('treasure', time)

      const key = engine.utility.choose([...registry.keys()], srand())
      const generator = registry.get(key)

      return {
        key,
        time,
        ...defaults,
        ...generator(srand),
      }
    },
    register: function (key, generator) {
      registry.set(key, generator)
      return this
    },
  }
})()

/*
TODO: registrations

alien artifact
bone (human, icthyosaur, megalodon, plesiosaur, sauropod, therapod, whale) (femur, humerus, jawbone, rib, skull, tooth, veritbrea) (chipped, partial, pristine)
coin (stone, copper, bronze, iron, steel) (chipped, corroded, decayed, encrusted, pristine)
dogtag (anderson, brown, chavez, hernandez, garcia, johnson, jones, kim, lee, lopez, martinez, miller, olson, rodriguez, smith, sullivan, williams, wong) (corroded, encrusted, pristine)
navigation (compass, telescope)
trash (barrel, bottle, shoe, tire, umbrella, vase)
uxo (allied, axis)
*/
