/*
 * glCheck: checks browser for proper WebGL support
 *
 * Copyright (c) 2016 Cameron Beccario
 */
'use strict'

var µ = require('./micro')
var GLU = require('./glu')

module.exports = (function () {
  var res = { pass: false }
  try {
    var gl = GLU.getWebGL(GLU.createCanvas())
    if (!gl) {
      res.hasContext = false
      return res // Fatal: WebGL not supported.
    }
    var glu = GLU.attach(gl)

    res.floatTex = !!gl.getExtension('OES_texture_float')
    res.floatTexLinear = !!gl.getExtension('OES_texture_float_linear')
    if (!res.floatTex) {
      return res // Fatal: float textures not supported. (We can live without linear support.)
    }

    var vertexShader = glu.makeShader(gl.VERTEX_SHADER, GLU.planeVertexShader())
    var program1 = glu.makeProgram([vertexShader, glu.makeShader(gl.FRAGMENT_SHADER, 'precision highp float;\nprecision highp sampler2D;\n\nconst float WIDTH = 3.0;\n\n                           //     0.5          1.5            2.5         : x coord\n                           //     0.166        0.5            0.833       : normalized x coord\nuniform sampler2D u_Tex0;  // [(0,0,0,1), (10,10,10,  1), (20,20,20,  1)] : LUMINANCE, NEAREST\nuniform sampler2D u_Tex1;  // [(0,0,0,0), (10,10,10,-10), (20,20,20,-20)] : LUMINANCE_ALPHA, LINEAR\n\nvoid main() {\n    vec2 st = (floor(gl_FragCoord.xy) + 0.20) / WIDTH;  // x = 0.2, 1.2, 2.2  =>  x = 0.066, 0.4, 0.733\n    vec4 c0 = texture2D(u_Tex0, st);\n    vec4 c1 = texture2D(u_Tex1, st);\n    gl_FragColor = vec4(c0.r, c1.r, c1.a * -1.0, float(c0.r == 7e37)) / 255.0;\n}\n')])

    var width = 3,
      height = 1
    var tex0 = glu.makeTexture2D({
      format: gl.LUMINANCE,
      type: gl.FLOAT,
      width: width,
      height: height,
      data: new Float32Array([0, 10, 20])
    })
    var tex1 = glu.makeTexture2D({
      format: gl.LUMINANCE_ALPHA,
      type: gl.FLOAT,
      width: width,
      height: height,
      data: new Float32Array([0, 0, 10, -10, 20, -20]),
      TEXTURE_MIN_FILTER: res.floatTexLinear ? gl.LINEAR : gl.NEAREST,
      TEXTURE_MAG_FILTER: res.floatTexLinear ? gl.LINEAR : gl.NEAREST
    })
    var target = glu.makeTexture2D({
      format: gl.RGBA,
      type: gl.UNSIGNED_BYTE,
      width: width,
      height: height,
      data: null
    })

    var textures = { a: { texture: tex0, unit: 0 }, b: { texture: tex1, unit: 1 } }
    gl.activeTexture(gl.TEXTURE0 + textures.a.unit)
    gl.bindTexture(gl.TEXTURE_2D, tex0)
    gl.activeTexture(gl.TEXTURE0 + textures.b.unit)
    gl.bindTexture(gl.TEXTURE_2D, tex1)

    glu.makeFramebufferTexture2D(target)
    gl.viewport(0, 0, width, height)

    gl.useProgram(program1)
    glu.attribs(program1).set(GLU.unitPlaneAttributes())
    glu.uniforms(program1, textures).set({ u_Tex0: 'a', u_Tex1: 'b' })
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    var out = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out)
    if (µ.arraysEq(out, [0, 0, 0, 0, 10, 7, 7, 0, 20, 17, 17, 0])) {
      res.floatTexLinear = true
    } else if (µ.arraysEq(out, [0, 0, 0, 0, 10, 10, 10, 0, 20, 20, 20, 0])) {
      res.floatTexLinear = false // float textures work, just not linear filtering.
    } else {
      res.floatTexLinear = res.floatTex = false
      return res // Fatal: float texture lookup completely failed.
    }

    glu.updateTexture2D(tex0, {
      format: gl.LUMINANCE,
      type: gl.FLOAT,
      width: width,
      height: height,
      data: new Float32Array([7e37, 100, 200])
    })
    gl.activeTexture(gl.TEXTURE0 + textures.a.unit)
    gl.bindTexture(gl.TEXTURE_2D, tex0)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out)
    if (out[4] !== 100 || out[8] !== 200) {
      res.texSubImage2D = false
      return res
    }
    if (out[3] !== 1) {
      res.missingVal = false
      return res
    }

    var program2 = glu.makeProgram([vertexShader, glu.makeShader(gl.FRAGMENT_SHADER, 'precision highp float;\n\nvoid main() {\n    float asin_err = abs(asin(0.894) - 1.1061944) * 100.0;\n    gl_FragColor = vec4(asin_err);\n}\n')])
    gl.useProgram(program2)
    glu.attribs(program2).set(GLU.unitPlaneAttributes())
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out)
    if (out[0] !== 0) {
      res.asin = false
      return res
    }

    res.maxTexSize = +gl.getParameter(gl.MAX_TEXTURE_SIZE) || -1
    var f = gl['getShaderPrecisionFormat'] ? gl['getShaderPrecisionFormat'](gl.FRAGMENT_SHADER, gl.HIGH_FLOAT) : {}
    res.precision = +(f || {}).precision || -1
    if (res.maxTexSize < 4096 || res.precision < 23) {
      return res // Fatal: not enough.
    }

    res.err = gl.getError()
    res.pass = !res.err
  } catch (e) {
    res.err = e.toString()
  }
  return res
}())
