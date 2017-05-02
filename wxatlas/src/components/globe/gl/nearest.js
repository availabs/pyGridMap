/*
 * nearest: a nearest-neighbor interpolator for scalar and vector fields.
 */
'use strict'

var µ = {}
µ.arrayHashCode = function (array) {
  var samples = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity

  var data = void 0
  switch (array.byteLength % 4) {
    case 0:
      data = new Int32Array(array.buffer); break
    case 2:
      data = new Int16Array(array.buffer); break
    default:
      data = new Int8Array(array.buffer); break
  }
  return _arrayHashCode(data, samples)
}
function _arrayHashCode (array, samples) {
  var result = new Int32Array([array.byteLength])
  var step = Math.max(array.length / samples, 1)
  for (var i = 0; i < array.length; i += step) {
    result[0] = 31 * result[0] + array[Math.floor(i)]
  }
  return result[0]
}
var lookup = require('./lookup')

/**
 * @param grid a grid that supports the "closest" function.
 * @param {Float32Array} data backing data, the same length as the grid.
 * @returns {Function} a nearest neighbor interpolation function f([λ, φ]) -> v
 */
function scalar (grid, data) {
  var hash = µ.arrayHashCode(data, 1000)

    /**
     * @param {number[]} coord [λ, φ] in degrees.
     * @returns {number} the nearest neighbor value or 7e37 if none.
     */
  function nearest (coord) {
    var i = grid.closest(coord)
    return i === i ? data[i] : 7e37
  }

    /**
     * @param {GLUStick} glu
     */
  nearest.webgl = function (glu) {
    var gl = glu.context
    var look = lookup(glu, grid.dimensions())
    return {
      shaderSource: function shaderSource () {
        return [look.scalarSource(), look.shaderSourceTexture2D()]
      },
      textures: function textures () {
        return {
          weather_data: look.scalarTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: gl.NEAREST,
            TEXTURE_MAG_FILTER: gl.NEAREST
          })
        }
      },
      uniforms: function uniforms () {
        return { u_Data: 'weather_data' }
      }
    }
  }

  return nearest
}

/**
 * @param grid a grid that supports the "closest" function.
 * @param {Float32Array|number[]} data backing data in [u0, v0, u1, v1, ...] layout, double the grid size.
 * @returns {Function} a nearest neighbor interpolation function f([λ, φ]) -> [u, v, m]
 */
function vector (grid, data) {
  var hash = µ.arrayHashCode(data, 1000)

    /**
     * @param {number[]} coord [λ, φ] in degrees.
     * @returns {number[]} the nearest neighbor value as a vector [u, v, m] or [7e37, 7e37, 7e37] if none.
     */
  function nearest (coord) {
    var j = grid.closest(coord) * 2
    if (j === j) {
      var u = data[j],
        v = data[j + 1]
      if (u < 7e37 && v < 7e37) {
        return [u, v, Math.sqrt(u * u + v * v)]
      }
    }
    return [7e37, 7e37, 7e37]
  }

    /**
     * @param {GLUStick} glu
     */
  nearest.webgl = function (glu) {
    var gl = glu.context
    var look = lookup(glu, grid.dimensions())
    return {
      shaderSource: function shaderSource () {
        return [look.vectorSource(), look.shaderSourceTexture2D()]
      },
      textures: function textures () {
        return {
          weather_data: look.vectorTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: gl.NEAREST,
            TEXTURE_MAG_FILTER: gl.NEAREST
          })
        }
      },
      uniforms: function uniforms () {
        return { u_Data: 'weather_data' }
      }
    }
  }

  return nearest
}

module.exports = {
  scalar: scalar,
  vector: vector
}
