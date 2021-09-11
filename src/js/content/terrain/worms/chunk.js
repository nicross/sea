content.terrain.worms.chunk = {}

content.terrain.worms.chunk.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.terrain.worms.chunk.prototype = {
  construct: function ({
    size = 0,
    x = 0,
    y = 0,
  } = {}) {
    this.size = size
    this.x = x
    this.y = y

    this.ready = this.generate()

    return this
  },
  generate: async function () {
    const srand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y)
    const count = Math.round(srand(1, 3))

    for (let i = 0; i < count; i += 1) {
      const srand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y, 'worm', i)

      const x = srand(this.x * this.size, (this.x + 1) * this.size),
        y = srand(this.y * this.size, (this.y + 1) * this.size),
        z = content.terrain.floor.value(x, y)

      await content.utility.async.schedule(() => this.generateWorm({
        length: srand(250, 2500),
        pitchScale: srand(100, 200),
        radiusScale: srand(50, 150),
        seed: [i],
        x,
        y,
        yawScale: srand(100, 200),
        z,
      }))
    }

    return this
  },
  generateWorm: async function ({
    length,
    pitchScale,
    radiusScale,
    seed = [],
    x,
    y,
    yawScale,
    z,
  }) {
    // XXX: Special debugging case, always place a cave at origin
    if (!this.x && !this.y && seed.length == 1 && !seed[0]) {
      x = 0
      y = 0
      z = content.terrain.floor.value(x, y)
    }

    const batchSize = 100,
      granularity = 1/2

    const radiusField = engine.utility.perlin1d.create('terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'radius'),
      pitchField = engine.utility.perlin1d.create('terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'pitch'),
      yawField = engine.utility.perlin1d.create('terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'yaw')

    let distance = 0

    // Generate points asynchronously along [0, distance] in batches of batchSize
    while (distance < length) {
      await content.utility.async.schedule(() => {
        for (let batchIndex = 0; batchIndex < batchSize && distance < length; batchIndex += 1) {
          const radius = radiusField.value(distance / radiusScale)

          content.terrain.worms.addPoint({
            radius: engine.utility.lerp(2, 10, radius),
            x,
            y,
            z,
          })

          const pitch = pitchField.value(distance / pitchScale),
            yaw = yawField.value(distance / yawScale)

          const vector = engine.utility.vector3d.create({
            x: Math.cos(yaw * engine.const.tau),
            y: Math.sin(yaw * engine.const.tau),
            z: engine.utility.lerp(0, -0.75, pitch),
          }).normalize().scale(granularity)

          distance += granularity
          x += vector.x
          y += vector.y
          z += vector.z

          // TODO: Roll for a branch
        }
      })
    }

    return this
  },
}
