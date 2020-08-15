app.utility = {}

app.utility.formatAccessibleTime = (time = 0) => {
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
