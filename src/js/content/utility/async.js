content.utility.async = (() => {
  const queue = []

  let active

  function dequeue() {
    active = queue.shift()

    if (active) {
      active.execute()
    }
  }

  function enqueue(fn) {
    const promise = new Promise((resolve, reject) => {
      const proxy = {
        cancel: () => reject(),
        execute: () => setTimeout(() => {
          const result = fn()
          resolve(result)
          dequeue()
        }),
      }

      if (active) {
        queue.push(proxy)
      } else {
        active = proxy
        proxy.execute()
      }
    })

    promise.then(() => {}, () => {})

    return promise
  }

  return {
    reset: function () {
      if (active) {
        active.cancel()
      }

      active = null
      queue.length = 0

      return this
    },
    schedule: (fn) => enqueue(fn),
  }
})()

engine.state.on('reset', () => content.utility.async.reset())
