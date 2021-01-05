engine.utility.octree.prototype.findMany = function (query = {}, radius = Infinity, count = 0) {
  // TODO: Add distance heap and return array limited to count closest items
  // SEE: https://stackoverflow.com/questions/2486093/millions-of-3d-points-how-to-find-the-10-of-them-closest-to-a-given-point

  if (!('x' in query && 'y' in query && 'z' in query)) {
    return []
  }

  if (count <= 0 || !isFinite(count)) {
    return []
  }

  if (
       isFinite(radius)
    && !this.intersects({
        depth: radius * 2,
        height: radius * 2,
        width: radius * 2,
        x: query.x - radius,
        y: query.y - radius,
        z: query.z - radius,
      })
  ) {
    return []
  }

  const distance = ({x, y, z}) => ((x - query.x) ** 2) + ((y - query.y) ** 2) + ((z - query.z) ** 2),
    index = this.getIndex(query),
    radius3 = ((radius * (Math.sqrt(3) / 3)) ** 2) * 3

  if (index == -1) {
    let minDistance = radius3,
      result

    for (const item of this.items) {
      if (item === query) {
        continue
      }

      const d = distance(item)

      if (d < minDistance) {
        minDistance = d
        result = item
      }
    }

    return []
  }

  let result = this.nodes[index].find(query, radius)
  let minDistance = result ? distance(result) : radius3

  for (const node of this.nodes) {
    if (node === this.nodes[index]) {
      continue
    }

    const item = node.find(query, minDistance)

    if (!item || item === query) {
      continue
    }

    const d = distance(item)

    if (d < minDistance) {
      minDistance = d
      result = item
    }
  }

  return []
}
