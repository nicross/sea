app.storage = (() => {
  const isSupported = 'localStorage' in window

  const storage = isSupported
    ? window.localStorage
    : {
        data: {},
        getItem: (key) => this.data[key],
        removeItem: (key) => delete this.data[key],
        setItem: (key) => this.data[key] = value,
      }

  const storageKey = 'sea_save'

  const legacyKeys = {
    game: 'sea_game',
    settings: 'sea_settings',
    stats: 'sea_stats',
    treasures: 'sea_treasures',
    version: 'sea_version',
  }

  let storageVersion

  function get(key) {
    try {
      const value = storage.getItem(key)
      return JSON.parse(value)
    } catch (e) {}
  }

  function getLegacyData() {
    const data = {}

    for (const [key, value] of Object.entries(legacyKeys)) {
      data[key] = get(value)
    }

    return data
  }

  function getVersioned(key) {
    const data = get(storageKey) || {}

    return data[storageVersion]
      ? data[storageVersion][key]
      : null
  }

  function set(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (e) {}
  }

  function setVersioned(key, value) {
    const data = get(storageKey) || {}

    if (!data[storageVersion]) {
      data[storageVersion] = {}
    }

    data[storageVersion][key] = value
    set(storageKey, data)
  }

  return {
    clone: function (from, to) {
      const data = get(storageKey) || {},
        legacyData = getLegacyData()

      to = to.replace('-debug', '')

      data[to] = from == legacyData.version
        ? legacyData
        : data[from] || {}

      data[to].version = to
      set(storageKey, data)

      return this
    },
    clearGame: function () {
      setVersioned('game', null)
      return this
    },
    getGame: function () {
      return getVersioned('game') || {}
    },
    getSettings: function () {
      return getVersioned('settings') || {}
    },
    getStats: function () {
      return getVersioned('stats') || {}
    },
    getTreasures: function () {
      return getVersioned('treasures') || []
    },
    getVersion: function () {
      return storageVersion
    },
    getVersions: function () {
      const data = get(storageKey) || {},
        legacyData = getLegacyData()

      return [
        legacyData.version,
        ...Object.keys(data),
      ].filter(Boolean).sort((a, b) => {
        return app.utility.semver.compare(a.semver, b.semver)
      })
    },
    hasGame: () => Boolean(getVersioned('game')),
    hasTreasures: function () {
      return this.getTreasures().length > 0
    },
    setGame: function (value) {
      setVersioned('game', value)
      return this
    },
    setStats: function (value) {
      setVersioned('stats', value)
      return this
    },
    setSettings: function (value) {
      setVersioned('settings', value)
      return this
    },
    setTreasures: function (value) {
      setVersioned('treasures', value)
      return this
    },
    setVersion: function (value) {
      storageVersion = value.replace('-debug', '')
      return this
    },
  }
})()
