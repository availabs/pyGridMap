'use strict'

var _createClass = (function () { function defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor } }())

function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

!(function () {
  var palette = module.exports = {}

  var π = Math.PI,
    τ = 2 * π
  var µ = require('./micro')
  var chroma = require('chroma-js')

  function colorInterpolator (start, end) {
    var r = start[0],
      g = start[1],
      b = start[2]
    var Δr = end[0] - r,
      Δg = end[1] - g,
      Δb = end[2] - b

    return function (i, a) {
      // console.log('r, g, b, a', [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a])
      return [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a]
    }
  }

    /**
     * Produces a color style in a rainbow-like trefoil color space. Not quite HSV, but produces a nice
     * spectrum. See http://krazydad.com/tutorials/makecolors.php.
     *
     * @param hue the hue rotation in the range [0, 1]
     * @param a the alpha value in the range [0, 255]
     * @returns {Array} [r, g, b, a]
     */
  palette.sinebowColor = function (hue, a) {
        // Map hue [0, 1] to radians [0, 5/6τ]. Don't allow a full rotation because that keeps hue == 0 and
        // hue == 1 from mapping to the same color.
    var rad = hue * τ * 5 / 6
    rad *= 0.75 // increase frequency to 2/3 cycle per rad

    var s = Math.sin(rad)
    var c = Math.cos(rad)
    var r = Math.floor(Math.max(0, -c) * 255)
    var g = Math.floor(Math.max(s, 0) * 255)
    var b = Math.floor(Math.max(c, 0, -s) * 255)
    return [r, g, b, a]
  }

  var BOUNDARY = 0.45
  var fadeToWhite = colorInterpolator(palette.sinebowColor(1.0, 0), [255, 255, 255])

    /**
     * Interpolates a sinebow color where 0 <= i <= j, then fades to white where j < i <= 1.
     *
     * @param i number in the range [0, 1]
     * @param a alpha value in range [0, 255]
     * @returns {Array} [r, g, b, a]
     */
  palette.extendedSinebowColor = function (i, a) {
    return i <= BOUNDARY ? palette.sinebowColor(i / BOUNDARY, a) : fadeToWhite((i - BOUNDARY) / (1 - BOUNDARY), a)
  }

    /**
     * Creates a color scale composed of the specified segments. Segments is an array of two-element arrays of the
     * form [value, color], where value is the point along the scale and color is the [r, g, b] color at that point.
     * For example, the following creates a scale that smoothly transitions from red to green to blue along the
     * points 0.5, 1.0, and 3.5:
     *
     *     [ [ 0.5, [255,   0,   0] ],
     *       [ 1.0, [  0, 255,   0] ],
     *       [ 3.5, [  0,   0, 255] ] ]
     *
     * @param segments array of color segments
     * @returns {Function} a function(point, alpha) that returns the color [r, g, b, alpha] for the given point.
     */
  palette.segmentedColorScale = function (segments) {
    var points = [],
      interpolators = [],
      ranges = []
    for (var i = 0; i < segments.length - 1; i++) {
      points.push(segments[i + 1][0])
      // points.push(segments[i][0])
      // console.log('points', points)
      interpolators.push(colorInterpolator(segments[i][1], segments[i + 1][1]))

      // console.log('interpolators', interpolators)
      ranges.push([segments[i][0], segments[i + 1][0]])
    }

    return function (point, alpha) {
      var i = void 0
      for (i = 0; i < points.length - 1; i++) {
        if (point <= points[i]) {
          break
        }
      }
      var range = ranges[i]
      return interpolators[i](µ.proportion(point, range[0], range[1]), alpha)
    }
  }

    /**
     * Converts an array of N color stops into N-1 chroma scales:
     *
     *    {color: "black", mode: "lch", p: 10},
     *    {color: "grey",  mode: "lab", p: 20},
     *    {color: "white",              p: 30}
     *
     * Result:
     *    scale 0 [black, grey] over domain [10, 20] in lch color space
     *    scale 1 [grey, white] over domain [20, 30] in lab color space
     *
     * @param {Array} stops an array of colors stops to convert into scales.
     * @returns {Array} an array of chroma.js scales.
     */
  palette.scalesFrom = function (stops) {
    var scales = []
    for (var i = 0; i < stops.length - 1; i++) {
      var lo = stops[i],
        hi = stops[i + 1]
      scales.push(chroma.scale([chroma(lo.color), chroma(hi.color)]).domain([lo.p, hi.p]).mode(lo.mode))
    }
    return scales
  }

    /**
     * Given a range [a, b] and two adjoining color scales L (i) and R (i+1) sharing domain point p, insert a new
     * bezier-interpolated scale M over the points [a, p, b].
     *
     * @param {Array} scales
     * @param {Number} i
     * @param {Array} range
     * @returns {Array}
     */
  palette.smooth = function (scales, i, range) {
        //         p                  p
        //        / \              M _-_
        //       /   \      =>      /   \
        //      /     \            a     b
        //   L /       \ R      K /       \ S
        //    Lx       Ry        Lx       Ry

    var L = scales[i],
      R = scales[i + 1],
      lx = L.domain()[0],
      ry = R.domain()[1],
      p = L.domain()[1]
    var a = range[0],
      b = range[1]

    var K = chroma.scale([L(lx), L(a)]).domain([lx, a]).mode(L.mode())
    var M = chroma.scale(chroma.bezier([L(a), L(p), R(b)])).domain([a, b]).mode(L.mode())
    var S = chroma.scale([R(b), R(ry)]).domain([b, ry]).mode(R.mode())

    return [].concat(scales.slice(0, i), [K, M, S], scales.slice(i + 2))
  }

    /**
     * Use array A of length n to define a linear scale over domain [x, y] such that [x, y] is mapped onto indices
     * [0, n-1]. The range [a, b] is then mapped to indices [i, j] using this scale, and the elements A[i] to A[j] are
     * filled with the results of f(v) where v iterates over [a, b].
     *
     * @param {Uint8Array} array the destination array to fill as rgba quadlets: [r0, g0, b0, a0, ...]
     * @param {Number[]} domain the values [x, y], inclusive.
     * @param {Number[]} range the values [a, b], inclusive.
     * @param {Function} ƒcolor the value function f(v) that returns [r, g, b, a] for the specified value.
     */
  palette.fillRange = function (array, domain, range, ƒcolor) {
        //    |-----------domain------------|
        //    |        |---range---|        |
        //    x        a           b        y
        //    0        i           j      len-1
        // A [0, ..., f(a), ..., f(b), ..., 0]

    var x = domain[0],
      y = domain[1],
      Δ = (y - x) / (array.length / 4 - 1)
    var a = range[0],
      b = range[1]
    var start = Math.round((a - x) / Δ),
      end = Math.round((b - x) / Δ)
    for (var i = start; i < end + 1; i++) {
      var c = ƒcolor(x + i * Δ)
      // console.log('x + i * Δ', x + i * Δ)
      // var c = ƒcolor
      // console.log('c', c)
      var j = i * 4
      array[j] = c[0]
      array[j + 1] = c[1]
      array[j + 2] = c[2]
      array[j + 3] = µ.coalesce(c[3], 255) // default to alpha 1.0 if not specified.
    }
  }

    /**
     * Convert a set of chroma.js scales into an accessor function over a computed array of rgba colors.
     *
     * @param {Number[]} bounds the values [x, y], inclusive.
     * @param {Array} scales the set of scales.
     * @param {Number} resolution the number of elements of the computed color array.
     * @returns {Uint8Array} sequence of rgba quadlets: [r0, g0, b0, a0, r1, g1, b1, a1, ...]
     */
  palette.quantize = function (bounds, scales, resolution) {
    var array = new Uint8Array(resolution * 4)
    scales.forEach(function (scale) {
      palette.fillRange(array, bounds, scale.domain(), function (v) {
        return scale(v).rgba().map(Math.round)
      })
    })
    return array
  }

  palette.buildScaleFromChromaScales = function (bounds, scales, resolution) {
    var colors = palette.quantize(bounds, scales, resolution)
    return palette.buildScale(bounds, colors)
  }

  palette.buildScaleFromSegments = function (bounds, segments, resolution) {
    var gradient = palette.segmentedColorScale(segments)
    var array = new Uint8Array(resolution * 4)
    palette.fillRange(array, bounds, bounds, gradient)
    return palette.buildScale(bounds, array)
  }

    /**
     * @param {Number[]} bounds [low, high] values. Assumes bounds are _center_ aligned color stops.
     * @param {Uint8Array} colors sequence of rgba quadlets: [r0, g0, b0, a0, r1, g1, b1, a1, ...]
     * @param {Function} [ƒmap] the scale function, like Math.log (default is linear).
     * @param {Function} [ƒinv] the inverse scale function, like Math.exp (default is linear).
     * @returns {Scale}
     */
  palette.buildScale = function (bounds, colors) {
    var ƒmap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (v) {
      return v
    }
    var ƒinv = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (v) {
      return v
    }

        /*
         Two types of scale representations:
         0        10        20        30        40        50   <= Split range [0, 50] (inclusive) over 5 buckets.
        |         |         |         |         |         |      Stops are aligned with _edges_ of buckets.
        +---------+---------+---------+---------+---------+
        | 0 black | 1 blue  | 2 green | 3  red  | 4 white |   array.length == n == 5
        +---------+---------+---------+---------+---------+
             |         |         |         |         |
             5        15        25        35        45        <= Color stops define _centers_, where distance between
                                                                 stops is bucket size. Range here is [5, 45].
         These two scales are equivalent but use different formulas to map value -> index for array access, and
        value -> texcoord on range [0, 1].
         For edge aligned stops:
            texcoord s = (value - edgeLow) / (edgeHigh - edgeLow)
            index    i = s * n - 0.5
         For center aligned stops:
            index    i = (value - centerLow) / (centerHigh - centerLow) * (n - 1)
            texcoord s = (i + 0.5) / n
         To convert between the two different scale types, expand/contract the bounds based on bucket count:
            [centerLow, centerHigh] == [edgeLow + ε, edgeHigh - ε]  where ε = (edgeHigh - edgeLow) / 2n
            [edgeLow, edgeHigh] == [centerLow - ε, centerHigh + ε]  where ε = (centerHigh - centerLow) / 2(n-1)
          */
    var lo = ƒmap(bounds[0]),
      hi = ƒmap(bounds[1])
    // var iMax = colors.length / 4 - 1,
    //   scale = iMax / (hi - lo)
    var hash = µ.arrayHashCode(colors, 1000)
    // var ε = (hi - lo) / (2 * iMax)
    // var edgeLo = lo - ε,
    //   edgeHi = hi + ε,
    //   edgeRange = [edgeLo, edgeHi - edgeLo]
    var edgeRange = [lo, hi-lo]

      // edgeRange = [edgeLo, edgeHi]
      // console.log('edgeRange', edgeRange)
      // console.log('ε', ε)
      // console.log('edgeLo', edgeLo)
      // console.log('edgeHi', edgeHi)
    return new (function () {
      function Scale () {
        _classCallCheck(this, Scale)
      }

      _createClass(Scale, [{
        key: 'indexOf',

                /**
                 * @param {Number} value the scale value
                 * @returns {Number} the rgba quadlet index; multiply by 4 for the true index in the colors array.
                 */
        value: function indexOf (value) {
          var i = Math.round((ƒmap(value) - lo) * scale)
          return µ.clamp(i, 0, iMax)
        }

                /**
                 * @param index the rgba quadlet index
                 * @returns {Number} the associated scale value
                 */

      }, {
        key: 'valueFor',
        value: function valueFor (index) {
          return ƒinv(index / scale + lo)
        }

                /**
                 * @param {Number} value the scale value
                 * @returns {Number[]} rgba quadlet for the specified value
                 */

      }, {
        key: 'rgba',
        value: function rgba (value) {
          var j = this.indexOf(value) * 4
          return [colors[j], colors[j + 1], colors[j + 2], colors[j + 3]]
        }

                /**
                 * @param {GLUStick} glu
                 */

      }, {
        key: 'webgl',
        value: function webgl (glu) {
          var gl = glu.context
          return {
            shaderSource: function shaderSource () {
              var mapper = ƒmap === Math.log ? '\nfloat fmap(in float v) {\n    return log(v);\n}\n' : '\nfloat fmap(in float v) {\n    return v;\n}\n'
              return [mapper, '\nuniform vec2 u_Range;  // [min, size]\n' +
                              'uniform lowp sampler2D u_Palette;\n' +
                              'uniform lowp float u_Alpha;\n\n' +
                              'lowp vec4 colorize(in float v) {\n' +
                              'vec2 st = vec2((fmap(v) - u_Range.x) / u_Range.y, 0.5);\n' +
                              'lowp vec4 color = texture2D(u_Palette, st);\n' +
                              'lowp float alpha = (1.0 - step(7e37, v)) * u_Alpha;\n' +
                              'return vec4(color.rgb, alpha);  // premultiply alpha\n}\n'
                            ]
            },
            textures: function textures () {
              return {
                color_scale: {
                  format: gl.RGBA,
                  type: gl.UNSIGNED_BYTE,
                  width: colors.length / 4,
                  height: 1,
                  data: colors,
                  hash: hash
                }
              }
            },
            uniforms: function uniforms () {
              return {
                u_Range: edgeRange,
                u_Palette: 'color_scale',
                u_Alpha: 1.0
              }
            }
          }
        }
      }, {
        key: 'colors',

                /**
                 * @returns {Uint8Array} [r0, g0, b0, a0, r1, g1, b1, a1, ...]
                 */
        get: function get () {
          return colors
        }

                /**
                 * @returns {Number[]} [low, high] bounds of this scale.
                 */

      }, {
        key: 'bounds',
        get: function get () {
          return bounds
        }
      }])

      return Scale
    }())()
  }
}())
