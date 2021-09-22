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

  const storagePrefix = 'shiftbacktick_sea_'

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

  function getAllVersioned(version) {
    const legacyData = getLegacyData()

    if (version == legacyData.version) {
      return legacyData
    }

    const data = {},
      keys = get(prefixed(version, 'keys')) || []

    for (const key of keys) {
      data[key] = get(prefixed(version, key))
    }

    return data
  }

  function getLegacyData() {
    const data = {}

    for (const [key, value] of Object.entries(legacyKeys)) {
      data[key] = get(value)
    }

    return data
  }

  function getVersioned(key) {
    key = prefixed(storageVersion, key)
    return get(key)
  }

  function prefixed(...keys) {
    return storagePrefix + keys.join('_')
  }

  function set(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (e) {}
  }

  function setVersioned(key, value) {
    touchVersionedKey(key)
    key = prefixed(storageVersion, key)
    set(key, value)
  }

  function touchVersionedKey(key) {
    const storageKey = prefixed(storageVersion, 'keys')
    const keys = get(storageKey) || []

    if (!keys.length) {
      keys.push('keys')
    }

    if (keys.includes(key)) {
      return
    }

    keys.push(key)
    set(storageKey, keys)
  }

  return {
    clone: function (from, to) {
      const data = getAllVersioned(from)

      to = to.replace('-debug', '')

      for (const [key, value] of Object.entries(data)) {
        set(prefixed(to, key), value)
      }

      return this
    },
    clearGame: function () {
      setVersioned('game', null)
      return this
    },
    getAll: function () {
      const data = {},
        keys = this.getKeys()

      for (const key of keys) {
        data[key] = getVersioned(key)
      }

      return data
    },
    getGame: function () {
      return getVersioned('game') || {}
    },
    getKeys: function () {
      return getVersioned('keys') || []
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
      const data = get(prefixed('versions')) || [],
        legacyData = getLegacyData()

      return [
        legacyData.version,
        ...data,
      ].filter(Boolean).sort((a, b) => {
        return app.utility.semver.compare(a, b)
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
    setKeys: function (value) {
      setVersioned('keys', value)
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

      const versions = get(prefixed('versions')) || []

      if (!versions.includes(storageVersion)) {
        versions.push(storageVersion)
        set(prefixed('versions'), versions)
      }

      return this
    },
  }
})()
