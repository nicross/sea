content.utility.threed = {}

content.utility.threed.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.utility.threed.prototype = {
  construct: function () {
    this.store = {}
    return this
  },
  export: function () {
    // XXX: Shallow copy
    return {...this.store}
  },
  get: function (x, y, z) {
    if (!(x in this.store)) {
      this.store[x] = {}
      this.store[x][y] = {}
    } else if (!(y in this.store[x])) {
      this.store[x][y] = {}
    }

    return this.store[x][y][z]
  },
  has: function (x, y, z) {
    if (x in this.store) {
      if (y in this.store[x]) {
        return z in this.store[x][y]
      }
    }

    return false
  },
  import: function (data = {}) {
    // XXX: Shallow copy
    this.store = {...data}
    return this
  },
  reset: function () {
    this.store = {}
    return this
  },
  set: function (x, y, z, value) {
    if (!(x in this.store)) {
      this.store[x] = {}
      this.store[x][y] = {}
    } else if (!(y in this.store[x])) {
      this.store[x][y] = {}
    }

    this.store[x][y][z] = value

    return this
  },
}
