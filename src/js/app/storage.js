app.storage = (() => {
  let version

  function get(key) {
    const data = app.storage.api.get(version) || {}
    return data[key]
  }

  function set(key, value) {
    app.storage.api.set(version, key, value)
  }

  return {
    clone: function (from, to) {
      const data = from == this.legacy.version()
        ? this.legacy.data()
        : app.storage.api.get(from)

      for (const key of Object.keys(data)) {
        this.api.set(to, key, data[key])
      }

      return this
    },
    clearGame: function () {
      set('game', null)
      return this
    },
    getGame: function () {
      return get('game') || {}
    },
    getKeys: function () {
      return get('keys') || []
    },
    getSettings: function () {
      return get('settings') || {}
    },
    getStats: function () {
      return get('stats') || {}
    },
    getTreasures: function () {
      return get('treasures') || []
    },
    getVersion: function () {
      return version
    },
    getVersions: function () {
      return [
        this.legacy.version(),
        ...this.api.versions(),
      ].filter(Boolean).sort((a, b) => {
        return app.utility.semver.compare(a, b)
      })
    },
    hasGame: () => Boolean(get('game')),
    hasTreasures: function () {
      return this.getTreasures().length > 0
    },
    ready: function () {
      return this.api.ready()
    },
    setGame: function (value) {
      set('game', value)
      return this
    },
    setKeys: function (value) {
      set('keys', value)
      return this
    },
    setStats: function (value) {
      set('stats', value)
      return this
    },
    setSettings: function (value) {
      set('settings', value)
      return this
    },
    setTreasures: function (value) {
      set('treasures', value)
      return this
    },
    setVersion: function (value) {
      version = value.replace('-debug', '')
      return this
    },
  }
})()
