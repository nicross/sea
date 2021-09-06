content.utility.async = {}

content.utility.async.schedule = async (fn) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn())
    })
  })
}
