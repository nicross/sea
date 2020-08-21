content.system.terrain = {
  isSolid: function (x, y, z) {
    const floor = this.floor.value(x, y)

    if (z > floor) {
      return false
    }

    /*
      TODO: Other terrain features:
      - expanses
    */

    return this.lattice.isSolid(x, y, z)
      && this.latitudinalTube.isSolid(x, y, z)
      && this.longitudinalTube.isSolid(x, y, z)
      && this.verticalTube.isSolid(x, y, z)
  }
}
