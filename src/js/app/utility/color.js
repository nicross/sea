// SEE: https://gist.github.com/mjackson/5311256
app.utility.color = {}

app.utility.color.hslToRgb = ({h = 0, s = 0, l = 0} = {}) => {
  let r, g, b

  h = engine.utility.wrap(h)

  if (s) {
    const convert = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = convert(p, q, h + 1/3)
    g = convert(p, q, h)
    b = convert(p, q, h - 1/3)
  } else {
    r = g = b = l
  }

  return {
    r: engine.utility.clamp(Math.floor(r * 256), 0, 255),
    g: engine.utility.clamp(Math.floor(g * 256), 0, 255),
    b: engine.utility.clamp(Math.floor(b * 256), 0, 255),
  }
}
