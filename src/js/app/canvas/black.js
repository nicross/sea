app.canvas.black = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  canvas.height = 1
  canvas.width = 1

  context.fillStyle = '#000000'
  context.fillRect(0, 0, 1, 1)

  return {
    draw: function () {
      // Draw to main canvas
      main.context().drawImage(canvas, 0, 0, main.width(), main.height())
      return this
    },
  }
})()
