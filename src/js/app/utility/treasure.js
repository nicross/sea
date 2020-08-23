app.utility.treasure = {}

app.utility.treasure.computeValue = ({
  value = 0,
  z = 0,
}) => value * Math.max(1, Math.abs(z / 1000))
