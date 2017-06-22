var one = function (bounds, resolution) {
   // var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;
  var resolution = resolution || 5000
  var palette = require('./palette')

  var bounds = bounds || [5000, 5950] // units: m/s
  var array = new Uint8Array(resolution * 4)
  console.log('sine rainbow', palette.extendedSinebowColor)
  palette.fillRange(array, [0, 1], [0, 1], palette.extendedSinebowColor)

  return palette.buildScale(bounds, array)
}

module.exports = one