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
    this.worms = []
    this.x = x
    this.y = y

    this.generate()

    this.ready = Promise.all(
      this.worms.map((worm) => worm.ready)
    )

    return this
  },
  generate: function () {
    // Determine worm count
    // XXX: Special case for chunk at origin, generate an unusual number of worms
    const isOrigin = !this.x && !this.y,
      srand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y)

    const count = isOrigin
     ? 3
     : Math.round(srand(0, 2))

     // Generate worms
    for (let index = 0; index < count; index += 1) {
      const worm = content.terrain.worms.worm.create({
        chunk: this,
        index,
      })

      this.worms.push(worm)
    }

    return this
  },
}
