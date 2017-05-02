'use strict'

module.exports = function (bounds) {
  var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000

  var palette = require('./palette')

  var bounds = bounds || [500, 595] // units: m/s
  var array = new Uint8Array(resolution * 4)
  palette.fillRange(array, [0, 1], [0, 1], palette.extendedSinebowColor)

  return palette.buildScale(bounds, array)
}
