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

  const gameKey = 'sea_game'

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
    hasGame: function () {
      return Boolean(this.getGame())
    },
    setGame: function (value) {
      set(gameKey, value)
      return this
    },
  }
})()
