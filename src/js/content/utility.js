content.utility = {}

content.utility.distance = (x1, y1, z1, x2, y2, z2) => {
  return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2) + ((z2 - z1) ** 2))
}

content.utility.distanceRadius = (x1, y1, z1, x2, y2, z2, radius = 0) => {
  return Math.max(0, content.utility.distance(x1, y1, z1, x2, y2, z2) - radius)
}
