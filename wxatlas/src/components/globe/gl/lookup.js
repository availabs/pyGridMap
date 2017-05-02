'use strict'

var _ = require('underscore')

/**
 *
 * @param {GLUStick} glu
 * @param dims
 * @returns {*}
 */
module.exports = function (glu, dims) {
  var gl = glu.context
  var width = dims.width,
    height = dims.height

  return {
    shaderSourceTexture2D: function shaderSourceTexture2D () {
      return '\nuniform sampler2D u_Data;\n\nfloat lookup(in vec2 st) {\n    vec4 h = texture2D(u_Data, st);\n    return scalarize(h);\n}\n'
    },
    shaderSourceBilinearWrap: function shaderSourceBilinearWrap () {
      return '\nuniform sampler2D u_Data;\nuniform vec2 u_TextureSize;\n\nfloat lookup(in vec2 st) {\n    // adapted from http://www.iquilezles.org/www/articles/hwinterpolation/hwinterpolation.htm\n    vec2 uv = st * u_TextureSize - 0.5;\n    vec2 iuv = floor(uv);\n    vec2 fuv = fract(uv);\n    vec2 ruv = 1.0 - fuv;\n\n    // UNDONE: fract usable below only for cylindrical grids\n    vec4 a = texture2D(u_Data, fract((iuv + vec2(0.5, 0.5)) / u_TextureSize));  // LL\n    vec4 b = texture2D(u_Data, fract((iuv + vec2(1.5, 0.5)) / u_TextureSize));  // LR\n    vec4 c = texture2D(u_Data, fract((iuv + vec2(0.5, 1.5)) / u_TextureSize));  // UL\n    vec4 d = texture2D(u_Data, fract((iuv + vec2(1.5, 1.5)) / u_TextureSize));  // UR\n    vec4 h;\n\n    int tag = int(dot(step(7e37, vec4(a.x, b.x, c.x, d.x)), vec4(1.0, 2.0, 4.0, 8.0)));\n    if (tag == 0) {\n        // a b c d\n        h = mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\n    } else if (tag == 1 && ruv.y < fuv.x) {\n        // d b c\n        h = d + ruv.x * (c - d) + ruv.y * (b - d);\n    } else if (tag == 2 && fuv.x < fuv.y) {\n        // c a d\n        h = c + fuv.x * (d - c) + ruv.y * (a - c);\n    } else if (tag == 4 && fuv.x >= fuv.y) {\n        // b a d\n        h = b + ruv.x * (a - b) + fuv.y * (d - b);\n    } else if (tag == 8 && fuv.x <= ruv.y) {\n        // a b c\n        h = a + fuv.x * (b - a) + fuv.y * (c - a);\n    } else {\n        // not enough points to interpolate\n        h = vec4(7e37);\n    }\n\n    return scalarize(h);\n}\n'
    },
    scalarSource: function scalarSource () {
      return '\nfloat scalarize(in vec4 h) {\n    return h.x;\n}\n'
    },
    vectorSource: function vectorSource () {
      return '\nfloat scalarize(in vec4 h) {\n    return length(h.xw);  // UNDONE: sqrt(7e37^2) ok?\n}\n'
    },
    scalarTexture: function scalarTexture (data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

      return _.extend({
        format: gl.LUMINANCE,
        type: gl.FLOAT,
        width: width,
        height: height,
        data: data
      }, options)
    },
    vectorTexture: function vectorTexture (data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

      return _.extend({
        format: gl.LUMINANCE_ALPHA,
        type: gl.FLOAT,
        width: width,
        height: height,
        data: data
      }, options)
    }
  }
}
