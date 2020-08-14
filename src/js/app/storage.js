app.storage = (() => {
  const isSupported = 'localStorage' in window

  const storage = isSupported
    ? window.localStorage
    : {
        data: {},
        getItem: (key) => this.data[key],
        setItem: (key) => this.data[key] = value,
      }

  const gameKey = 'sea_game'

  function get(key) {
    return storage.getItem(key)
  }

  function set(key, value) {
    return storage.setItem(key, value)
  }

  return {
    clearGame: function () {
      return this.setHighscore(0)
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
