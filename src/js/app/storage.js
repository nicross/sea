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

  const gameKey = 'sea_game',
    settingsKey = 'sea_settings',
    statsKey = 'sea_stats',
    treasuresKey = 'sea_treasures'

  function get(key) {
    try {
      const value = storage.getItem(key)
      return JSON.parse(value)
    } catch (e) {}
  }

  function remove(key) {
    return storage.removeItem(key)
  }

  function set(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (e) {}
  }

  return {
    clearGame: function () {
      remove(gameKey)
      return this
    },
    getGame: () => get(gameKey) || {},
    getSettings: () => get(settingsKey) || {},
    getStats: () => get(statsKey) || {},
    getTreasures: () => get(treasuresKey) || [],
    hasGame: () => Boolean(get(gameKey)),
    hasTreasures: function () {
      return this.getTreasures().length > 0
    },
    setGame: function (value) {
      set(gameKey, value)
      return this
    },
    setStats: function (value) {
      set(statsKey, value)
      return this
    },
    setSettings: function (value) {
      set(settingsKey, value)
      return this
    },
    setTreasures: function (value) {
      set(treasuresKey, value)
      return this
    },
  }
})()
