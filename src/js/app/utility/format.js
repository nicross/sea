app.utility.format = {}

app.utility.format.coordinates = function ({
  x = 0,
  y = 0,
} = {}) {
  x = Math.round(x)
  y = Math.round(y)

  if (!x && !y) {
    return 'Origin'
  }

  if (y >= 0) {
    label += `${this.number(y)} <abbr aria-label="North">N</abbr>`
  } else {
    label += `${this.number(y)} <abbr aria-label="South">S</abbr>`
  }

  label += ' '

  if (x >= 0) {
    label += `${this.number(x)} <abbr aria-label="East">E</abbr>`
  } else {
    label += `${this.number(x)} <abbr aria-label="West">W</abbr>`
  }

  return label
}

app.utility.format.number = (() => {
  const numberFormat = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  })

  return (...args) => numberFormat.format(...args)
})()

app.utility.format.time = (time = 0) => {
  time = Math.round(time)

  const days = Math.floor(time / (24 * 60 * 60))
  time %= 24 * 60 * 60

  const hours = Math.floor(time / (60 * 60))
  time %= 60 * 60

  const minutes = Math.floor(time / 60)
  time %= 60

  const seconds = time

  let label = ''

  if (days) {
    label += `${days} <abbr aria-label="day${days == 1 ? '' : 's'}">d</abbr> `
  }

  if (days || hours) {
    label += `${hours} <abbr aria-label="hour${hours == 1 ? '' : 's'}">h</abbr> `
  }

  if (days || hours || minutes) {
    label += `${minutes} <abbr aria-label="minute${minutes == 1 ? '' : 's'}">m</abbr> `
  }

  label += `${seconds} <abbr aria-label="second${seconds == 1 ? '' : 's'}">s</abbr>`

  return label
}
