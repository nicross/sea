'use strict'

app.component.treasure = {}

app.component.treasure.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.treasure.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (treasure = {}) {
    this.rootElement = document.createElement('div')
    this.rootElement.className = 'c-treasure'
    this.rootElement.tabIndex = 0

    const title = document.createElement('p')
    title.classList.add('c-treasure--name')
    title.innerHTML = treasure.name
    this.rootElement.appendChild(title)

    const details = document.createElement('div')
    details.classList.add('c-treasure--details')
    this.rootElement.append(details)

    const valueContainer = document.createElement('p')
    valueContainer.classList.add('c-treasure--value')
    valueContainer.innerHTML = `<span class="c-treasure--label">Value:</span> ${app.utility.format.number(app.utility.treasure.computeValue(treasure))} <abbr aria-label="gold">g</abbr>`
    details.appendChild(valueContainer)

    return this
  },
}
