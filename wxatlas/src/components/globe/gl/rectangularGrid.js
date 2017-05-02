var _ = require('underscore')
var µ = require('./micro.js')

var π = Math.PI,
  τ = 2 * π,
  RAD = τ / 360

module.exports = function rectangularGrid (λaxis, φaxis) {
  var nx = Math.floor(λaxis.size) // number of lon points
  var ny = Math.floor(φaxis.size) // number of lat points
  var np = nx * ny // total number of points
  var Δλ = µ.decimalize(λaxis.delta) // distance between lon points
  var Δφ = µ.decimalize(φaxis.delta) // distance between lat points
  var λ0 = µ.decimalize(λaxis.start) // lon origin
  var φ0 = µ.decimalize(φaxis.start) // lat origin, expected to be on range [-90, 90]
  var λ1 = λ0 + Δλ * (nx - 1) // lon upper bound
  var φ1 = φ0 + Δφ * (ny - 1) // lat upper bound

  var λlow = (λ0 - Δλ / 2) * RAD
  var λhigh = (λ1 + Δλ / 2) * RAD
  var λsize = λhigh - λlow
  var φlow = (φ0 - Δφ / 2) * RAD
  var φhigh = (φ1 + Δφ / 2) * RAD
  var φsize = φhigh - φlow
  var low = [λlow, φlow]
  var size = [λsize, φsize]

    // console.log('low', low, 'size', size)

  var isCylinder = Math.floor(nx * Δλ) >= 360 // true if the grid forms a cylinder

    // function iterator() {
    //    var i = 0;
    //    return {
    //        next: function() {
    //            if (i >= np) {
    //                return {done: true};
    //            }
    //            var x = i % nx;
    //            var y = Math.floor(i / nx);
    //            var λ = λ0 + x * Δλ;
    //            var φ = φ0 + y * Δφ;
    //            return {value: [λ, φ, i++], done: false};
    //        },
    //    };
    // }

    /** @returns {{width: number, height: number}} dimensions of this grid */
  function dimensions () {
    return { width: nx, height: ny }
  }

    /** @returns {boolean} true if the grid fully wraps around longitudinal axis */
  function isCylindrical () {
    return isCylinder
  }

    /**
     * @param {Function} cb the callback ƒ(λ, φ, i), where a truthy return value terminates the iteration.
     * @param {number?} start the starting grid index.
     * @returns {number} the grid index of the next iteration, or NaN if iteration is finished.
     */
  function forEach (cb, start) {
    for (var i = start || 0; i < np; i++) {
      var x = i % nx
      var y = Math.floor(i / nx)
      var λ = λ0 + x * Δλ
      var φ = φ0 + y * Δφ
      if (cb(λ, φ, i)) {
        return i + 1 // Terminate iteration and return next grid index.
      }
    }
    return NaN // Iteration is finished.
  }

    /**
     * @param {number[]} coord [λ, φ] in degrees
     * @returns {number} index of closest grid point or NaN if further than Δλ/2 or Δφ/2 from the grid boundary.
     */
  function closest (coord) {
    var λ = coord[0]
    var φ = coord[1]
    if (λ === λ && φ === φ) {
      var x = µ.floorMod(λ - λ0, 360) / Δλ
      var y = (φ - φ0) / Δφ
      var rx = Math.round(x)
      var ry = Math.round(y)

      if (ry >= 0 && ry < ny && rx >= 0 && (rx < nx || rx === nx && isCylinder)) {
        var i = ry * nx + rx
        return rx === nx ? i - nx : i
      }
    }
    return NaN
  }

    /**
     * Identifies the four points surrounding the specified coordinates. The result is a six-element array:
     *
     *     0-3: the indices of the four points, in increasing order.
     *     4,5: the fraction that λ,φ is away from the first point, normalized to the range [0, 1].
     *
     * Example:
     * <pre>
     *          1      2           After converting λ and φ to positions on the x and y grid axes, we find the
     *         fx  x   cx          four points that enclose point [x, y]. These points are at the four
     *          | =1.4 |           corners specified by the floor and ceiling of x and y. For example, given
     *       --i00-|--i10-- fy 8   x = 1.4 and y = 8.3, the four surrounding grid points are [1, 8], [2, 8],
     *     y ___|_ .   |           [1, 9] and [2, 9]. These points have index i00, i10, i01, i11, respectively,
     *   =8.3   |      |           and result of this function is an array [i00, i10, i01, i11, 0.4, 0.3].
     *       --i01----i11-- cy 9
     *          |      |
     * </pre>
     *
     * @param {number[]} coord [λ, φ] in degrees
     * @returns {number[]} the indices of the four grid points surrounding the coordinate pair and the (x,y) fraction,
     *          or [NaN, NaN, NaN, NaN, NaN, NaN] if all points are not found.
     */
  function closest4 (coord) {
    var λ = coord[0]
    var φ = coord[1]
    if (λ === λ && φ === φ) {
      var x = µ.floorMod(λ - λ0, 360) / Δλ
      var y = (φ - φ0) / Δφ
      var fx = Math.floor(x)
      var fy = Math.floor(y)
      var cx = fx + 1
      var cy = fy + 1
      var Δx = x - fx
      var Δy = y - fy

      if (fy >= 0 && cy < ny && fx >= 0 && (cx < nx || cx === nx && isCylinder)) {
        var i00 = fy * nx + fx
        var i10 = i00 + 1
        var i01 = i00 + nx
        var i11 = i01 + 1
        if (cx === nx) {
          i10 -= nx
          i11 -= nx
        }
        return [i00, i10, i01, i11, Δx, Δy]
      }
    }
    return [NaN, NaN, NaN, NaN, NaN, NaN]
  }

  function webgl () {
    return {
      shaderSource: function shaderSource () {
        return '\nuniform vec2 u_Low;\nuniform vec2 u_Size;\n\nvec2 grid(in vec2 coord) {\n    vec2 tex = (coord - u_Low) / u_Size;\n    float s = tex.s;\n    float t = tex.t;\n\n    if (t < 0.0 || 1.0 < t) discard;  // lat out of bounds, so nothing to draw\n\n    return vec2(fract(s), t);  // UNDONE: fract used here only because lon is circular.\n}\n'
      },
      textures: function textures () {
        return {}
      },
      uniforms: function uniforms () {
        return { u_Low: low, u_Size: size }
      }
    }
  }

  return {
    dimensions: dimensions,
    isCylindrical: isCylindrical,
    forEach: forEach,
    closest: closest,
    closest4: closest4,
    webgl: webgl
  }
}
