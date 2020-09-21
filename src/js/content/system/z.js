// XXX: Proxy for engine.position
// TODO: Remove and replace with engine.position
// TODO: Update script that converts data.z to data.position.z

content.system.z = (() => {
  return {
    set: function (value) {
      const vector = engine.position.getVector()

      engine.position.setVector({
        x: vector.x,
        y: vector.y,
        z: value,
      })

      return this
    },
  }
})()
