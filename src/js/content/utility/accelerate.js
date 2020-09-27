// Interpolates current vector to target vector at delta rate
// TODO: Is there a more elegant way to do this with vector math?

content.utility.accelerate = (current, target, rate = 1) => {
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

  const deltaRate = engine.loop.delta() * rate

  for (const axis of ['x', 'y', 'z']) {
    if (current[axis] - deltaRate > target[axis]) {
      next[axis] -= deltaRate
    } else if (current[axis] + deltaRate < target[axis]) {
      next[axis] += deltaRate
    } else {
      next[axis] = target[axis]
    }
  }

  return next
}
