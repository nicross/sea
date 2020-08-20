content.system.scan = (() => {
  const maxDistance = 50,
    stepDistance = 1,
    unit2 = Math.sqrt(2) / 2,
    unit3 = Math.sqrt(3) / 3

  // TODO: cooldown

  function raytrace(position, vector) {
    let {
      x: dx = 0,
      y: dy = 0,
      z: dz = 0,
    } = vector

    let {x, y, z} = position

    let d = 0,
      isSolid

    dx *= stepDistance
    dy *= stepDistance
    dz *= stepDistance

    do {
      x += dx
      y += dy
      z += dz
      d += stepDistance
      isSolid = content.system.terrain.isSolid(x, y, z)
    } while (!isSolid && d < maxDistance)

    return isSolid
      ? d / maxDistance
      : -1
  }

  function scan() {
    const {angle, x, y} = engine.position.get()
    const z = content.system.z.get()

    const position = {
      angle,
      x,
      y,
      z,
    }

    return {
      center: {
        // 0deg - A
        // z + 1
        93: raytrace(position, {z: 1}),
        81: raytrace(position, {x: unit2, z: unit2}),
        69: raytrace(position, {x: 1}),
        57: raytrace(position, {x: unit2, z: -unit2}),
        45: raytrace(position, {z: -1}),
        // 180deg - C
        72: raytrace(position, {x: -unit2, z: unit2}),
        60: raytrace(position, {x: -1}),
        48: raytrace(position, {x: -unit2, z: -unit2})
      },
      // 45deg - G
      aheadL: {
        79: raytrace(position, {x: unit3, y: -unit3, z: unit3}),
        67: raytrace(position, {x: unit2, y: -unit2}),
        55: raytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      },
      aheadR: {
        79: raytrace(position, {x: unit3, y: unit3, z: unit3}),
        67: raytrace(position, {x: unit2, y: unit2}),
        55: raytrace(position, {x: unit3, y: unit3, z: -unit3}),
      },
      // 90deg - E
      sideL: {
        76: raytrace(position, {y: -unit2, z: unit2}),
        64: raytrace(position, {y: -1}),
        52: raytrace(position, {y: -unit2, z: -unit2}),
      },
      sideR: {
        76: raytrace(position, {y: unit2, z: unit2}),
        64: raytrace(position, {y: 1}),
        52: raytrace(position, {y: unit2, z: -unit2}),
      },
      // 135deg - D
      behindL: {
        74: raytrace(position, {x: -unit3, y: -unit3, z: unit3}),
        62: raytrace(position, {x: -unit2, y: -unit2}),
        48: raytrace(position, {x: -unit3, y: -unit3, z: -unit3}),
      },
      behindR: {
        74: raytrace(position, {x: unit3, y: -unit3, z: unit3}),
        62: raytrace(position, {x: unit2, y: -unit2}),
        48: raytrace(position, {x: unit3, y: -unit3, z: -unit3}),
      },
    }
  }

  return {
    benchmark: function () {
      const start = performance.now()
      const result = scan()
      const time = performance.now() - start
      console.log(result)
      return time
    },
    trigger: function () {
      const results = scan()
      // TODO: trigger audio
      // TODO: generate treasure
      return this
    },
  }
})()
