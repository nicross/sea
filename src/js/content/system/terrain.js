content.system.terrain = {
  debug: function () {
    const {x, y, z} = engine.position.getVector()

    const now = performance.now()

    return {
      floor: {
        isAbove: z > this.floor.value(x, y),
        value: this.floor.value(x, y),
      },
      latitudinalTube: {
        inside: !this.latitudinalTube.isSolid(x, y, z),
        mix: this.latitudinalTube.getMix(x, y, z),
        range: this.latitudinalTube.getRange(x, y, z),
        value: this.latitudinalTube.getValue(x, y, z),
      },
      lattice: {
        inside: !this.lattice.isSolid(x, y, z),
        mix: this.lattice.getMix(x, y, z),
        range: this.lattice.getRange(x, y, z),
        value: this.lattice.getValue(x, y, z),
      },
      longitudinalTube: {
        inside: !this.longitudinalTube.isSolid(x, y, z),
        mix: this.longitudinalTube.getMix(x, y, z),
        range: this.longitudinalTube.getRange(x, y, z),
        value: this.longitudinalTube.getValue(x, y, z),
      },
      verticalTube: {
        inside: !this.verticalTube.isSolid(x, y, z),
        mix: this.verticalTube.getMix(x, y, z),
        range: this.verticalTube.getRange(x, y, z),
        value: this.verticalTube.getValue(x, y, z),
      },
      time: performance.now() - now,
    }
  },
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)

    if (z > floor) {
      return false
    }

    return this.lattice.isSolid(x, y, z)
      && this.latitudinalTube.isSolid(x, y, z)
      && this.longitudinalTube.isSolid(x, y, z)
      && this.verticalTube.isSolid(x, y, z)
  },
}
