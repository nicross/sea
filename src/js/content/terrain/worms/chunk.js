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

    this.ready = content.utility.async.schedule(() => this.generate())

    return this
  },
  generate: async function () {
    const isOrigin = !this.x && !this.y,
      srand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y)

    const count = Math.round(srand(0, 2)) + Number(isOrigin)

    for (let i = 0; i < count; i += 1) {
      const isOriginZero = isOrigin && !i,
        srand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y, 'worm', i)

      const length = isOriginZero
        ? 2000
        : srand(500, 2000)

      const x = isOriginZero
        ? 0
        : srand((this.x - 0.5) * this.size, (this.x + 0.5) * this.size)

      const y = isOriginZero
        ? 0
        : srand((this.y - 0.5) * this.size, (this.y + 0.5) * this.size)

      const z = content.terrain.floor.value(x, y)

      await content.utility.async.schedule(() => this.generateWorm({
        branchScale: length / srand(4, 16),
        length,
        pitchScale: srand(25, 50),
        radiusScale: srand(25, 50),
        seed: [i],
        x,
        y,
        yawScale: srand(25, 50),
        z,
      }))
    }

    return this
  },
  generateWorm: async function ({
    branchScale,
    length,
    pitchScale,
    radiusScale,
    seed = [],
    x,
    y,
    yawScale,
    z,
  }) {
    const granularity = 1/2,
      isBranch = seed.length > 1,
      minLength = 16

    const branchField = engine.utility.createNoiseWithOctaves({
      octaves: 2,
      seed: ['terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'branch'],
      type: engine.utility.perlin1d,
    })

    const branchRoller = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'branch', 'roller')

    const radiusField = engine.utility.createNoiseWithOctaves({
      octaves: 4,
      seed: ['terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'radius'],
      type: engine.utility.perlin1d,
    })

    const pitchField = engine.utility.createNoiseWithOctaves({
      octaves: 4,
      seed: ['terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'pitch'],
      type: engine.utility.perlin1d,
    })

    const yawField = engine.utility.createNoiseWithOctaves({
      octaves: 4,
      seed: ['terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, 'yaw'],
      type: engine.utility.perlin1d,
    })

    let distance = 0,
      branchIndex = 0,
      lastBranch = 0

    // Generate points asynchronously along [0, distance]
    while (distance < length) {
      await content.utility.async.schedule(async () => {
        // Determine batch size, optimizing closer to player
        const playerDistanceRatio = engine.position.getVector().distance({x, y}) / 2000
        const batchSize = engine.utility.lerpExp(100, 2000, playerDistanceRatio, 3)

        // Generate batch
        for (let batchIndex = 0; batchIndex < batchSize && distance < length; batchIndex += 1) {
          // Generate next point in branch
          const radius = radiusField.value(distance / radiusScale),
            radiusBias = engine.utility.clamp(engine.utility.scale(distance, length - minLength, length, 1, 0), 0, 1)

          content.terrain.worms.addPoint({
            radius: engine.utility.lerp(4, 16, radius * radiusBias),
            x,
            y,
            z,
          })

          const pitch = pitchField.value(distance / pitchScale),
            yaw = yawField.value(distance / yawScale)

          const zBias = isBranch
            ? 1
            : engine.utility.clamp(distance / minLength, 0, 1)

          const vector = engine.utility.vector3d.create({
            x: Math.cos(yaw * engine.const.tau) * engine.utility.lerp(1/4, 1, zBias),
            y: Math.sin(yaw * engine.const.tau) * engine.utility.lerp(1/4, 1, zBias),
            z: engine.utility.lerp(-1, engine.utility.lerp(0, -1, pitch), zBias),
          }).normalize().scale(granularity)

          distance += granularity
          x += vector.x
          y += vector.y
          z += vector.z

          // Determine whether to generate a branch
          if (length < minLength) {
            continue
          }

          const branchChance = (branchField.value(distance / branchScale) ** 4) // Base chance from field
            * (engine.utility.wrapAlternate(2 * distance / length, 0, 1) ** 2) // Prefer the center of the branch
            * (Math.abs((distance - lastBranch) / (distance - length)) ** 3) // Get more likely further from last branch
            * granularity // Scale by granularity

          const branchRoll = branchRoller()

          if (branchRoll > branchChance) {
            continue
          }

          // Generate new branch
          const branchSrand = engine.utility.srand('terrain', 'worms', 'chunk', this.x, this.y, 'worm', ...seed, branchIndex)
          const branchLength = (length - distance) / branchSrand(1, 2)

          if (branchLength < minLength) {
            continue
          }

          await content.utility.async.schedule(() => this.generateWorm({
            branchScale: branchLength / branchSrand(4, 16),
            length: branchLength,
            pitchScale: branchSrand(25, 50),
            radiusScale: branchSrand(25, 50),
            seed: [...seed, branchIndex],
            x,
            y,
            yawScale: branchSrand(25, 50),
            z,
          }))

          branchIndex += 1
          lastBranch = distance
        }
      })
    }

    return this
  },
}
