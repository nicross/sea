content.utility.altimeter = {
  isCloserToSurface: () => engine.position.getVector().z > content.terrain.floor.current()/2,
  isSurface: () => engine.position.getVector().z > content.surface.current(),
  isCloserToFloor: () => engine.position.getVector().z <= content.terrain.floor.current()/2,
}

// TODO: Expand into a state machine with utility methods that can handle most of the app/content z-checks between surface and floor
