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
    treasureKey = 'sea_treasure'

  function get(key) {
    return storage.getItem(key)
  }

  function remove(key) {
    return storage.removeItem(key)
  }

  function set(key, value) {
    return storage.setItem(key, value)
  }

  return {
    clearGame: function () {
      remove(gameKey)
      return this
    },
    getGame: () => get(gameKey),
    getSettings: () => get(settingsKey) || {},
    getStats: () => get(statsKey),
    getTreasure: () => get(treasureKey) || [],
    hasGame: function () {
      return Boolean(this.getGame())
    },
    hasStats: function () {
      return Boolean(this.getStats())
    },
    hasTreasure: function () {
      return this.getTreasure().length > 0
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
    setTreasure: function (value) {
      set(treasureKey, value)
      return this
    },
  }
})()
