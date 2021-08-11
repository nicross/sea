app.debug.cheats = {}

app.debug.cheats.reveal = function (radius = 500) {
  const position = engine.position.getVector()

  position.x = Math.round(position.x)
  position.y = Math.round(position.y)

  for (let x = -radius; x <= radius; x += 1) {
    for (let y = -radius; y <= radius; y += 1) {
      content.exploration.onCollision({
        x: position.x + x,
        y: position.y + y,
        z: content.terrain.floor.value(position.x + x, position.y + y),
      })
    }
  }

  return this
}
