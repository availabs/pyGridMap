/*
 * bilinear: a bilinear interpolator for scalar and vector fields that also handles triangles (3 points).
 */
'use strict'

var µ = require('./micro')
var lookup = require('./lookup')
var glReport = require('./glCheck')

/**
 * @param grid a grid that supports the "closest4" function.
 * @param {Float32Array} data backing data, the same length as the grid.
 * @returns {Function} a bilinear interpolation function f([λ, φ]) -> v
 */
function scalar (grid, data) {
  var hash = µ.arrayHashCode(data, 1000)

    /**
     * @param {number[]} coord [λ, φ] in degrees.
     * @returns {number} the bilinear interpolated value or 7e37 if none.
     */
  function bilinear (coord) {
    var indices = grid.closest4(coord)

    var i00 = indices[0]
    if (i00 === i00) {
      var i10 = indices[1]
      var i01 = indices[2]
      var i11 = indices[3]
      var x = indices[4]
      var y = indices[5]
      var rx = 1 - x
      var ry = 1 - y

      var v00 = data[i00]
      var v10 = data[i10]
      var v01 = data[i01]
      var v11 = data[i11]

      if (v00 < 7e37) {
        if (v10 < 7e37 && v01 < 7e37 && v11 < 7e37) {
          var a = rx * ry,
            b = x * ry,
            c = rx * y,
            d = x * y
          return v00 * a + v10 * b + v01 * c + v11 * d // 4 points found.
        } else if (v11 < 7e37 && v10 < 7e37 && x >= y) {
          return v10 + rx * (v00 - v10) + y * (v11 - v10) // 3 points found, triangle interpolate.
        } else if (v01 < 7e37 && v11 < 7e37 && x < y) {
          return v01 + x * (v11 - v01) + ry * (v00 - v01) // 3 points found, triangle interpolate.
        } else if (v01 < 7e37 && v10 < 7e37 && x <= ry) {
          return v00 + x * (v10 - v00) + y * (v01 - v00) // 3 points found, triangle interpolate.
        }
      } else if (v11 < 7e37 && v01 < 7e37 && v10 < 7e37 && x > ry) {
        return v11 + rx * (v01 - v11) + ry * (v10 - v11) // 3 points found, triangle interpolate.
      }
    }
    return 7e37
  }

    /**
     * @param {GLUStick} glu
     */
  bilinear.webgl = function (glu) {
    var gl = glu.context
    var useNative = true // glReport.floatTexLinear && !grid.isCylindrical();
    var look = lookup(glu, grid.dimensions())

    var _grid$dimensions = grid.dimensions(),
      width = _grid$dimensions.width,
      height = _grid$dimensions.height,
      textureSize = [width, height]

    return {
      shaderSource: function shaderSource () {
        return [look.scalarSource(), useNative ? look.shaderSourceTexture2D() : look.shaderSourceBilinearWrap()]
      },
      textures: function textures () {
                // console.log('texture_data scalar', data)
        return {
          weather_data: look.scalarTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: useNative ? gl.LINEAR : gl.NEAREST,
            TEXTURE_MAG_FILTER: useNative ? gl.LINEAR : gl.NEAREST
          })
        }
      },
      uniforms: function uniforms () {
        var result = { u_Data: 'weather_data' }
        if (!useNative) {
          result.u_TextureSize = textureSize
        }
        return result
      }
    }
  }

  return bilinear
}

/**
 * @param grid a grid that supports the "closest4" function.
 * @param {Float32Array|number[]} data backing data in [u0, v0, u1, v1, ...] layout, double the grid size.
 * @returns {Function} a bilinear interpolation function f([λ, φ]) -> [u, v, m]
 */
function vector (grid, data) {
  var hash = µ.arrayHashCode(data, 1000)

  function triangleInterpolateVector (x, y, u0, v0, u1, v1, u2, v2) {
    var u = u0 + x * (u2 - u0) + y * (u1 - u0)
    var v = v0 + x * (v2 - v0) + y * (v1 - v0)
    return [u, v, Math.sqrt(u * u + v * v)]
  }

    /**
     * @param {number[]} coord [λ, φ] in degrees.
     * @returns {number[]} the bilinear interpolated value as a vector [u, v, m] or [7e37, 7e37, 7e37] if none.
     */
  function bilinear (coord) {
    var indices = grid.closest4(coord)

    var j00 = indices[0] * 2
    if (j00 === j00) {
      var j10 = indices[1] * 2
      var j01 = indices[2] * 2
      var j11 = indices[3] * 2
      var x = indices[4]
      var y = indices[5]
      var rx = 1 - x
      var ry = 1 - y

      var u00 = data[j00]
      var v00 = data[j00 + 1]
      var u10 = data[j10]
      var v10 = data[j10 + 1]
      var u01 = data[j01]
      var v01 = data[j01 + 1]
      var u11 = data[j11]
      var v11 = data[j11 + 1]

      if (v00 < 7e37) {
        if (v10 < 7e37 && v01 < 7e37 && v11 < 7e37) {
          var a = rx * ry,
            b = x * ry,
            c = rx * y,
            d = x * y
          var u = u00 * a + u10 * b + u01 * c + u11 * d
          var v = v00 * a + v10 * b + v01 * c + v11 * d
          return [u, v, Math.sqrt(u * u + v * v)] // 4 points found.
        } else if (v11 < 7e37 && v10 < 7e37 && x >= y) {
          return triangleInterpolateVector(rx, y, u10, v10, u11, v11, u00, v00)
        } else if (v01 < 7e37 && v11 < 7e37 && x < y) {
          return triangleInterpolateVector(x, ry, u01, v01, u00, v00, u11, v11)
        } else if (v01 < 7e37 && v10 < 7e37 && x <= ry) {
          return triangleInterpolateVector(x, y, u00, v00, u01, v01, u10, v10)
        }
      } else if (v11 < 7e37 && v01 < 7e37 && v10 < 7e37 && x > ry) {
        return triangleInterpolateVector(rx, ry, u11, v11, u10, v10, u01, v01)
      }
    }
    return [7e37, 7e37, 7e37]
  }

    /**
     * @param {GLUStick} glu
     */
  bilinear.webgl = function (glu) {
    var gl = glu.context
    var useNative = glReport.floatTexLinear && !grid.isCylindrical()
    var look = lookup(glu, grid.dimensions())

    var _grid$dimensions2 = grid.dimensions(),
      width = _grid$dimensions2.width,
      height = _grid$dimensions2.height,
      textureSize = [width, height]

    return {
      shaderSource: function shaderSource () {
        return [look.vectorSource(), useNative ? look.shaderSourceTexture2D() : look.shaderSourceBilinearWrap()]
      },
      textures: function textures () {
        console.log('texture_data vector', data)
        return {
          weather_data: look.vectorTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: useNative ? gl.LINEAR : gl.NEAREST,
            TEXTURE_MAG_FILTER: useNative ? gl.LINEAR : gl.NEAREST
          })
        }
      },
      uniforms: function uniforms () {
        var result = { u_Data: 'weather_data' }
        if (!useNative) {
          result.u_TextureSize = textureSize
        }
        return result
      }
    }
  }

  return bilinear
}

module.exports = {
  scalar: scalar,
  vector: vector
}
