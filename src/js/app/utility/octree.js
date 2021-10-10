app.utility.octree = {}

app.utility.octree.reduce = function (tree, filterNode, filterItem, depth = 0) {
  const filteredItems = () => {
    if (filterItem) {
      return tree.items.filter(filterItem)
    }

    return [...tree.items]
  }

  if (!depth && !tree.nodes.length) {
    return filteredItems()
  }

  const center = {
    x: tree.x + (tree.width / 2),
    y: tree.y + (tree.height / 2),
    z: tree.z + (tree.depth / 2),
  }

  const radius = Math.max(tree.height, tree.width, tree.depth) * app.utility.octree.toUnit3

  if (!filterNode(center, radius)) {
    return []
  }

  if (tree.items.length) {
    return filteredItems()
  }

  const items = []
  depth += 1

  for (const subtree of tree.nodes) {
    items.push(...this.reduce(subtree, filterNode, filterItem, depth))
  }

  return items
}

app.utility.octree.toUnit3 = engine.utility.distance({x: 1, y: 1, z: 1})
