content.terrain = {
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)

    if (z > floor) {
      return false
    }

    if (this.worms.isInside(x, y, z)) {
      return false
    }

    return this.cheese.isSolid(x, y, z)
  },
}
