content.pois = (() => {
  const pois = [],
    pubsub = engine.utility.pubsub.create(),
    wormIds = new Set()

  function wormToPoi(worm) {
    const first = worm.points[0]

    return {
      id: worm.getId(),
      name: `Cave ${content.utility.nato.fromNumber(wormIds.size + 1)}`,
      type: 'worm',
      x: first.x,
      y: first.y,
      z: first.z,
    }
  }

  return engine.utility.pubsub.decorate({
    all: () => [...pois],
    count: () => pois.length,
    export: () => [...pois],
    import: function (data = []) {
      for (const poi of data) {
        pois.push(poi)

        if (poi.type == 'worm') {
          wormIds.add(poi.id)
        }
      }

      return this
    },
    ofType: (type) => pois.filter((poi) => poi.type == type),
    onScanRecharge: function ({
      worms: scannedWorms = [],
    }) {
      // Add newly scanned worms
      for (const worm of scannedWorms) {
        const id = worm.getId()

        if (wormIds.has(id)) {
          continue
        }

        const poi = wormToPoi(worm)

        pois.push(poi)
        wormIds.add(id)

        pubsub.emit('discover', poi)
      }

      return this
    },
    reset: function () {
      pois.length = 0
      wormIds.clear()

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.scan.on('recharge', (e) => content.pois.onScanRecharge(e))
})

engine.state.on('export', (data) => data.pois = content.pois.export())
engine.state.on('import', ({pois}) => content.pois.import(pois))
engine.state.on('reset', () => content.pois.reset())
