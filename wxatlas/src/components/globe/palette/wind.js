'use strict'

function hexToRgb (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

var one = function (bounds, resolution) {
   // var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;
  var resolution = resolution || 100
  var palette = require('./palette')

  var bounds = bounds || [500, 595] // units: m/s
  var array = new Uint8Array(resolution * 4)
  console.log(palette.extendedSinebowColor)
  palette.fillRange(array, [0, 1], [0, 1], palette.extendedSinebowColor)

  return palette.buildScale(bounds, array)
}

var two = function (bounds, resolution) {
  var resolution = resolution || 500
  var palette = require('./palette')
  var chroma = require('chroma-js')

  var bounds = bounds || [0.002, 2.500] // units: τ
  var logBounds = bounds.map(Math.log)
    // console.log(chroma.cubehelix())
  var scale = chroma.scale(chroma.cubehelix()).domain(logBounds)
  var colors = palette.quantize(logBounds, [scale], resolution)

  return palette.buildScale(bounds, colors, Math.log, Math.exp)
}

var three = function (bounds, resolution) {
  var resolution = resolution || 500
  var palette = require('./palette')

  var bounds = bounds || [40, 2500] // units: ppb
  console.log(bounds)
  var stops = [
        { color: [0, 38, 40], mode: 'lab', p: bounds[0] },
        { color: [255, 255, 224], mode: 'lch', p: 425 }, // background is ~100 ppb https://en.wikipedia.org/wiki/MOPITT
        { color: [0, 0, 154], mode: 'lab', p: 475 },
        { color: [0, 0, 0], mode: 'lab', p: bounds[1] }
  ]

  var scales = palette.scalesFrom(stops)
    // scales = palette.smooth(scales, 0, [360, 440]);
    // scales = palette.smooth(scales, 2, [440, 490]);
  return palette.buildScaleFromChromaScales(bounds, scales, resolution)
}

var four = function (bounds, resolution) {
    // var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;

  var palette = require('./palette')
  var resolution = resolution || 2000
  var bounds = bounds || [193, 328] // units: kelvins
  console.log('bounds', bounds)
  var colors = require('./rainbowGenerator')('tol-rainbow', bounds.leng)

  var segments = bounds.map((bound,i) => [bound,colors[i]])


  return palette.buildScaleFromSegments(bounds, segments, resolution)
}

var five = function (bounds, inColors, resolution) {
    // var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;

  var gen = require('./palette')
  resolution = 32
  var bounds = bounds || [193, 328] // units: kelvins
 
      var colors = [
        [200, 0, 0],
        [255, 50, 0],
        [255, 135, 0],
        [255, 200, 0],
        [255, 255, 0],
        [225, 225, 0],
        [150, 225, 0],
        [0, 225, 0],
        [0, 255, 170],
        [0, 200, 240],
        [0, 100, 200],
        [50, 0, 225],
        [125, 0, 225],
        [200, 0, 200],
        [150, 0, 150],
        [90, 0, 90]
      ].reverse()
  colors = inColors || colors
  //var pal = require('./rainbowGenerator')
  //colors = pal('tol-rainbow', bounds.length)
  var segments = bounds.map((d, i) => [d, colors[i]])
  var totalBounds = bounds ? [bounds[0], bounds[bounds.length - 1]] : [193, 328] // units: kelvins

  console.log('segments', segments)

  return gen.buildScaleFromSegments(totalBounds, segments, resolution)
}

var six = function (bounds, scheme, resolution) {
    // var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;


  var palette = require('./palette')
  var resolution = resolution || 2000
  var bounds = bounds || [193, 328] // units: kelvins
  var colorbrewer = require('colorbrewer')
  console.log('bounds', colorbrewer)
  var scheme = scheme || 'RdBu'
  var colors = colorbrewer[scheme][11].map(hexToRgb)

  var segments = bounds.map((d, i) => [d, colors[i]])
  var totalBounds = bounds ? [bounds[0], bounds[bounds.length - 1]] : [193, 328] // units: kelvins

  console.log('segments', segments)

  return palette.buildScaleFromSegments(totalBounds, segments, resolution)
}

module.exports = five
