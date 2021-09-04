content.terrain = {
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)
    return z <= floor
  },
}
