content.utility.altimeter = {
  isCloserToSurface: () => engine.position.getVector().z > content.const.lightZone/2,
  isCloserToFloor: () => engine.position.getVector().z <= content.const.lightZone/2,
}

// TODO: Expand into a state machine with utility methods that can handle most of the app/content z-checks between surface and floor
