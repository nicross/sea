content.system.terrain = {
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)

    if (z > floor) {
      return false
    }

    return true
  }
}
