app.utility.format = {}

app.utility.format.angle = function (radians = 0) {
  let degrees = engine.utility.radiansToDegrees(
    engine.const.tau - engine.utility.normalizeAngle(radians - Math.PI/2)
  )

  let label = ''

  if (degrees > 348.75 || degrees < 11.25) {
    label += '<abbr aria-label="north">N</abbr>'
  } else if (degrees < 33.75) {
    label += '<abbr aria-label="north-northeast">NNE</abbr>'
  } else if (degrees < 56.25) {
    label += '<abbr aria-label="northeast">NE</abbr>'
  } else if (degrees < 78.75) {
    label += '<abbr aria-label="east-northeast">ENE</abbr>'
  } else if (degrees < 101.25) {
    label += '<abbr aria-label="east">E</abbr>'
  } else if (degrees < 123.75) {
    label += '<abbr aria-label="east-southeast">ESE</abbr>'
  } else if (degrees < 146.25) {
    label += '<abbr aria-label="southeast">SE</abbr>'
  } else if (degrees < 168.75) {
    label += '<abbr aria-label="south-southeast">SSE</abbr>'
  } else if (degrees < 191.25) {
    label += '<abbr aria-label="south">S</abbr>'
  } else if (degrees < 213.75) {
    label += '<abbr aria-label="south-southwest">SSW</abbr>'
  } else if (degrees < 236.25) {
    label += '<abbr aria-label="southwest">SW</abbr>'
  } else if (degrees < 258.75) {
    label += '<abbr aria-label="west-southwest">WSW</abbr>'
  } else if (degrees < 281.25) {
    label += '<abbr aria-label="west">W</abbr>'
  } else if (degrees < 303.75) {
    label += '<abbr aria-label="west-northwest">WNW</abbr>'
  } else if (degrees < 326.25) {
    label += '<abbr aria-label="northwest">NW</abbr>'
  } else if (degrees < 348.75) {
    label += '<abbr aria-label="north-northwest">NNW</abbr>'
  }

  label += ` (${Math.round(degrees) % 360}<abbr aria-label=" degrees">°</abbr>)`;

  return label
}

app.utility.format.coordinates = function ({
  x = 0,
  y = 0,
  z = 0,
} = {}) {
  x = Math.round(x)
  y = Math.round(y)
  z = Math.round(z)

  let label = ''

  if (y > 0) {
    label += `${this.number(y)} <abbr aria-label="North">N</abbr>`
  } else if (y < 0) {
    label += `${this.number(Math.abs(y))} <abbr aria-label="South">S</abbr>`
  }

  if (y && x) {
    label += ', '
  }

  if (x > 0) {
    label += `${this.number(x)} <abbr aria-label="East">E</abbr>`
  } else if (x < 0) {
    label += `${this.number(Math.abs(x))} <abbr aria-label="West">W</abbr>`
  }

  if (!x && !y) {
    label += 'Origin'
  }

  if (z) {
    label += `, ${this.number(z)} meters`
  }

  return label
}

app.utility.format.clock = (value) => {
  let hour = Math.floor(value * 24)
  let minute = Math.floor(((value * 24) - hour) * 60)

  if (hour < 10) {
    hour = '0' + hour
  }

  if (minute < 10) {
    minute = '0' + minute
  }

  return `<time>${hour}:${minute}</time>`
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

app.utility.format.velocity = function (vector = {}) {
  const distance = engine.utility.distance(vector)
  return `${this.number(distance)} <abbr aria-label="meters per second">m/s</abbr>`
}
