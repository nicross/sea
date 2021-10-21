content.prop.base = engine.prop.base.invent((prototype) => ({
  construct: function ({
    destination,
  } = {}) {
    this.destination = destination
    this.periodic = {}
    return prototype.construct.apply(this, arguments)
  },
  fadeInDuration: engine.const.zeroTime,
  fadeOutDuration: engine.const.zeroTime,
  getOcclusion: async function ({
    batchSize = 500,
    threshold = 2,
  } = {}) {
    const step = content.terrain.voxels.granularity()

    const direction = engine.position.getVector()
      .subtract(this)
      .normalize()
      .scale(step)

    let count = 0,
      distance = step,
      x = this.x + direction.x,
      y = this.y + direction.y,
      z = this.z + direction.z

    while (distance < this.distance) {
      const isOccluded = await content.utility.async.schedule(() => {
        const batchMaxDistance = Math.min(this.distance, distance + (batchSize * step))

        while (distance < batchMaxDistance) {
          const voxel = content.terrain.voxels.get({x, y, z})

          if (voxel.isSolid) {
            count += 1

            if (count >= threshold) {
              return true
            }
          } else {
            count = 0
          }

          x += direction.x
          y += direction.y
          z += direction.z
          distance += step
        }

        return false
      })

      if (isOccluded) {
        return true
      }
    }

    return false
  },
  handlePeriodic: function ({
    delay = () => 0,
    key = '',
    trigger = () => Promise.resolve(),
  } = {}) {
    if (!(key in this.periodic)) {
      this.periodic[key] = {
        active: false,
        timer: delay() * Math.random(),
      }
    }

    const periodic = this.periodic[key]

    if (periodic.active) {
      return this
    }

    if (periodic.timer < 0) {
      periodic.timer = delay()
    }

    periodic.timer -= engine.loop.delta()

    if (periodic.timer <= 0) {
      const result = trigger() || Promise.resolve()
      periodic.active = true
      periodic.timer = -Infinity // XXX: Force delay() next inactive frame
      result.then(() => periodic.active = false)
    }

    return this
  },
  hasPeriodic: function (key) {
    return key in this.periodic
  },
  isPeriodicActive: function (key) {
    return this.periodic[key] && this.periodic[key].active
  },
  isPeriodicPending: function (key) {
    return this.periodic[key] && !this.periodic[key].active
  },
  rebuildBinaural: function () {
    this.binaural.destroy()

    this.binaural = engine.audio.binaural.create()
    this.binaural.from(this.output)
    this.binaural.to(this.destination)

    this.recalculate()

    return this
  },
  resetPeriodic: function (key) {
    delete this.periodic[key]
    return this
  },
}))
