app.utility.matrix4d = {}

app.utility.matrix4d.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.utility.matrix4d.fromQuaternion = function ({
  x = 0,
  y = 0,
  z = 0,
  w = 0,
} = {}) {
  const result = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ]

  const x2 = x + x,
    y2 = y + y,
    z2 = z + z

  const xx = x * x2,
    xy = x * y2,
    xz = x * z2

  const yy = y * y2,
    yz = y * z2,
    zz = z * z2

  const wx = w * x2,
    wy = w * y2,
    wz = w * z2

  result[0] = 1 - (yy + zz)
  result[1] = xy + wz
  result[2] = xz - wy

  result[4] = xy - wz
  result[5] = 1 - (xx + zz)
  result[6] = yz + wx

  result[8] = xz + wy
  result[9] = yz - wx
  result[10] = 1 - (xx + yy)

  result[15] = 1

  return app.utility.matrix4d.create(result)
}

app.utility.matrix4d.fromVector3d = function ({
  x = 0,
  y = 0,
  z = 0,
} = {}) {
  const result = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ]

  result[0] = 1
  result[5] = 1
  result[10] = 1
  result[12] = x
  result[13] = y
  result[14] = z
  result[15] = 1

  return app.utility.matrix4d.create(result)
}

app.utility.matrix4d.identity = function (...args) {
  return this.create([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ])
}

app.utility.matrix4d.prototype = {
  construct: function (elements = []) {
    this.elements = [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]

    elements = elements.slice(0, 16)

    for (const index in elements) {
      this.elements[index] = elements[index]
    }

    return this
  },
  applyToVector3d: function ({
    x = 0,
    y = 0,
    z = 0,
  } = {}) {
    const w = 1

    const [
      e11, e21, e31, e41,
      e12, e22, e32, e42,
      e13, e23, e33, e43,
      e14, e24, e34, e44,
    ] = this.elements

    return engine.utility.vector3d.create({
      x: (x * e11) + (y * e12) + (z * e13) + (w * e14),
      y: (x * e21) + (y * e22) + (z * e23) + (w * e24),
      z: (x * e31) + (y * e32) + (z * e33) + (w * e34),
    })
  },
  multiply: function (b = app.utility.matrix4d.identity()) {
    if (!app.utility.matrix4d.prototype.isPrototypeOf(b)) {
      b = app.utility.matrix4d.create(b)
    }

    const [
      a11, a21, a31, a41,
      a12, a22, a32, a42,
      a13, a23, a33, a43,
      a14, a24, a34, a44,
    ] = this.elements

    const [
      b11, b21, b31, b41,
      b12, b22, b32, b42,
      b13, b23, b33, b43,
      b14, b24, b34, b44,
    ] = b.elements

    const result = []

    result[0] = (a11 * b11) + (a12 * b21) + (a13 * b31) + (a14 * b41)
		result[4] = (a11 * b12) + (a12 * b22) + (a13 * b32) + (a14 * b42)
		result[8] = (a11 * b13) + (a12 * b23) + (a13 * b33) + (a14 * b43)
		result[12] = (a11 * b14) + (a12 * b24) + (a13 * b34) + (a14 * b44)

		result[1] = (a21 * b11) + (a22 * b21) + (a23 * b31) + (a24 * b41)
		result[5] = (a21 * b12) + (a22 * b22) + (a23 * b32) + (a24 * b42)
		result[9] = (a21 * b13) + (a22 * b23) + (a23 * b33) + (a24 * b43)
		result[13] = (a21 * b14) + (a22 * b24) + (a23 * b34) + (a24 * b44)

		result[2] = (a31 * b11) + (a32 * b21) + (a33 * b31) + (a34 * b41)
		result[6] = (a31 * b12) + (a32 * b22) + (a33 * b32) + (a34 * b42)
		result[10] = (a31 * b13) + (a32 * b23) + (a33 * b33) + (a34 * b43)
		result[14] = (a31 * b14) + (a32 * b24) + (a33 * b34) + (a34 * b44)

		result[3] = (a41 * b11) + (a42 * b21) + (a43 * b31) + (a44 * b41)
		result[7] = (a41 * b12) + (a42 * b22) + (a43 * b32) + (a44 * b42)
		result[11] = (a41 * b13) + (a42 * b23) + (a43 * b33) + (a44 * b43)
		result[15] = (a41 * b14) + (a42 * b24) + (a43 * b34) + (a44 * b44)

    return app.utility.matrix4d.create(result)
  },
  set: function (column, row, value) {
    const index = (row * 4) + column
    return this.setIndex(index, value)
  },
  setIndex: function (index, value) {
    this.elements[index] = value
    return this
  },
}
