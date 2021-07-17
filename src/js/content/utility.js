content.utility = {}

content.utility.smooth = (value, slope = 25) => {
  // Generalized logistic function
  return 1 / (1 + (Math.E ** (-slope * (value - 0.5))))
}
