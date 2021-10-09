app.utility.octree = {}

app.utility.octree.reduce = function (tree, filter, depth = 0) {
  if (!depth && !tree.nodes.length) {
    return [...tree.items]
  }

  const center = {
    x: tree.x + (tree.width / 2),
    y: tree.y + (tree.height / 2),
    z: tree.z + (tree.depth / 2),
  }

  const radius = Math.max(tree.height, tree.width, tree.depth) * app.utility.octree.toUnit3

  if (!filter(center, radius)) {
    return []
  }

  if (tree.items.length) {
    return [...tree.items]
  }

  const items = []
  depth += 1

  for (const subtree of tree.nodes) {
    items.push(...this.reduce(subtree, filter, depth))
  }

  return items
}

app.utility.octree.toUnit3 = engine.utility.distance({x: 1, y: 1, z: 1})
