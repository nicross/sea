content.utility.accelerate = {}

content.utility.accelerate.value = (current, target, rate = 1) => {
  if (current == target) {
    return target
  }

  const deltaRate = engine.loop.delta() * rate

  if (current - deltaRate > target) {
    return current - deltaRate
  }

  if (current + deltaRate < target) {
    return current + deltaRate
  }

  return target
}

content.utility.accelerate.vector = (current, target, rate = 1) => {
  if (!engine.utility.vector3d.prototype.isPrototypeOf(current)) {
    current = engine.utility.vector3d.create(current)
  }

  if (!engine.utility.vector3d.prototype.isPrototypeOf(target)) {
    target = engine.utility.vector3d.create(target)
  }

  const next = current.clone()

  if (current.equals(target)) {
    return next
  }

  const deltaRate = engine.loop.delta() * rate,
    normalized = target.subtract(current).normalize()

  for (const axis of ['x', 'y', 'z']) {
    const axisRate = deltaRate * Math.abs(normalized[axis])

    if (current[axis] - axisRate > target[axis]) {
      next[axis] -= axisRate
    } else if (current[axis] + axisRate < target[axis]) {
      next[axis] += axisRate
    } else {
      next[axis] = target[axis]
    }
  }

  return next
}
