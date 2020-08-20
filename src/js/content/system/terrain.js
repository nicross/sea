content.system.terrain = {
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)

    if (z > floor) {
      return false
    }

    /*
      TODO: Other terrain features:
      - latitudinal tubes
      - longitudinal tubes
      - vertical tubes
      - expanses
    */

    return this.lattice.isSolid(x, y, z)
  }
}
