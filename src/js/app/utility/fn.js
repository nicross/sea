app.utility.fn = {}

app.utility.fn.debounced = function (fn, timeout = 0) {
  let handler
  return (...args) => {
    clearTimeout(handler)
    handler = setTimeout(() => fn(...args), timeout)
  }
}
