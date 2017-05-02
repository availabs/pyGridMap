/*
 * glu: webgl helpers
 *
 * Copyright (c) 2016 Cameron Beccario
 */
'use strict'

var _createClass = (function () { function defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor } }())

function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

var _ = require('underscore')
var µ = require('./micro')

// var log = require("./../log")();

// see http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
//     http://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html

function throwOnErr (err) {
  throw new Error(err)
}

module.exports = (function () {
  function GLU () {
    _classCallCheck(this, GLU)
  }

  _createClass(GLU, null, [{
    key: 'createCanvas',

        /** @returns {HTMLCanvasElement} */
    value: function createCanvas () {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1

      var result = /** @type {HTMLCanvasElement} */document.createElement('canvas')
      result.width = width
      result.height = height
      return result
    }

        /**
         * @param {HTMLCanvasElement} canvas DOM element
         * @param {Object} [attributes] WebGL context attributes
         * @returns {WebGLRenderingContext} the context or undefined if not supported.
         */

  }, {
    key: 'getWebGL',
    value: function getWebGL (canvas, attributes) {
      var ctx = void 0
      try {
        ctx = canvas.getContext('webgl', attributes)
      } catch (ignore) {}
      if (!ctx) {
        try {
          ctx = canvas.getContext('experimental-webgl', attributes)
        } catch (ignore) {}
      }
      return ctx
    }

        /** @returns {string} */

  }, {
    key: 'planeVertexShader',
    value: function planeVertexShader () {
      return 'precision highp float;\n\nattribute vec2 a_Position;\nattribute vec2 a_TexCoord;\n\nvarying vec2 v_TexCoord;\n\nvoid main() {\n    gl_Position = vec4(a_Position, 0.0, 1.0);\n    v_TexCoord = a_TexCoord;\n}\n'
    }
  }, {
    key: 'unitPlaneAttributes',
    value: function unitPlaneAttributes () {
            // console.log('test',   {
            //     a_Position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            //     a_TexCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
            // })
      return {
        a_Position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        a_TexCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
      }
    }

        /**
         * @param {WebGLRenderingContext} gl
         * @returns {GLUStick}
         */

  }, {
    key: 'attach',
    value: function attach (gl) {
      var defaultPixelStore = {
        PACK_ALIGNMENT: 1,
        UNPACK_ALIGNMENT: 1,
        UNPACK_FLIP_Y_WEBGL: false,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: false,
        UNPACK_COLORSPACE_CONVERSION_WEBGL: gl.BROWSER_DEFAULT_WEBGL
      }

      var defaultPixelStoreKeys = Object.keys(defaultPixelStore)

      var defaultTexParams = {
        TEXTURE_MIN_FILTER: gl.NEAREST,
        TEXTURE_MAG_FILTER: gl.NEAREST,
        TEXTURE_WRAP_S: gl.CLAMP_TO_EDGE,
        TEXTURE_WRAP_T: gl.CLAMP_TO_EDGE
      }

      var defaultTexParamKeys = Object.keys(defaultTexParams)

      return new (function () {
        function GLUStick () {
          _classCallCheck(this, GLUStick)
        }

        _createClass(GLUStick, [{
          key: 'makeShader',

                    /**
                     * @param {number} type either VERTEX_SHADER or FRAGMENT_SHADER.
                     * @param {string} source shader source code.
                     * @param {Function} [ƒerr] ƒ(err) invoked when an error occurs.
                     * @returns {WebGLShader} the shader object, or null if the shader could not be compiled.
                     */
          value: function makeShader (type, source) {
            var ƒerr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : throwOnErr

            var shader = gl.createShader(type)
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              var message = gl.getShaderInfoLog(shader)
              gl.deleteShader(shader)
              ƒerr(message)
              return null
            }
            return shader
          }

                    /**
                     * @param {WebGLShader[]} shaders the compiled shaders.
                     * @param {Function} [ƒerr] ƒ(err) invoked when an error occurs.
                     * @returns {WebGLProgram} the program, or null if the program could not be linked.
                     */

        }, {
          key: 'makeProgram',
          value: function makeProgram (shaders) {
            var ƒerr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : throwOnErr

            var program = gl.createProgram()
            shaders.forEach(function (shader) {
              return gl.attachShader(program, shader)
            })
            gl.linkProgram(program)
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
              var message = gl.getProgramInfoLog(program)
              gl.deleteProgram(program)
              ƒerr(message)
              return null
            }
            return program
          }

                    /**
                     * @param {WebGLTexture} texture 2d texture
                     * @param {Function} [callback] ƒ(err) invoked when an error occurs.
                     * @returns {WebGLFramebuffer} the framebuffer, or null if the framebuffer is not complete.
                     */

        }, {
          key: 'makeFramebufferTexture2D',
          value: function makeFramebufferTexture2D (texture) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : throwOnErr

            var framebuffer = gl.createFramebuffer()
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
            var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
            if (status !== gl.FRAMEBUFFER_COMPLETE) {
              gl.deleteFramebuffer(framebuffer)
              callback('framebuffer: ' + status)
              return null
            }
            return framebuffer
          }

                    /**
                     * @param {WebGLProgram} program
                     * @param {Object} textures map from name to texture entry
                     * @returns {GLUUniforms}
                     */

        }, {
          key: 'uniforms',
          value: function uniforms (program, textures) {
            var _decls = {},
              count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
            _.range(count).map(function (i) {
              return gl.getActiveUniform(program, i)
            }).filter(function (e) {
              return !!e
            }).forEach(function (e) {
              var location = gl.getUniformLocation(program, e.name)
              _decls[e.name] = { name: e.name, type: e.type, size: e.size, location: location }
            })

            function assign (name, v) {
              var decl = _decls[name] || {},
                loc = decl.location
                            // console.log(`uniform ${name}: ${v}`);
              switch (decl.type) {
                case gl.FLOAT:
                  return µ.isArrayLike(v) ? gl.uniform1fv(loc, v) : gl.uniform1f(loc, v)
                case gl.FLOAT_VEC2:
                  return gl.uniform2fv(loc, v)
                case gl.FLOAT_VEC3:
                  return gl.uniform3fv(loc, v)
                case gl.FLOAT_VEC4:
                  return gl.uniform4fv(loc, v)
                case gl.INT:
                  return µ.isArrayLike(v) ? gl.uniform1iv(loc, v) : gl.uniform1i(loc, v)
                case gl.INT_VEC2:
                  return gl.uniform2iv(loc, v)
                case gl.INT_VEC3:
                  return gl.uniform3iv(loc, v)
                case gl.INT_VEC4:
                  return gl.uniform4iv(loc, v)
                case gl.SAMPLER_2D:
                  {
                    var entry = textures[v]
                    if (!entry) {
                      console.log("uniform '" + name + "' refers to unknown texture '" + v + "'")
                      return
                    }
                    gl.uniform1i(loc, entry.unit)
                    return
                  }
                default:
                  console.log("uniform '" + name + "' has unsupported type: " + JSON.stringify(decl))
              }
            }

            return new (function () {
              function GLUUniforms () {
                _classCallCheck(this, GLUUniforms)
              }

              _createClass(GLUUniforms, [{
                key: 'decls',
                value: function decls () {
                  return _decls
                }

                                /**
                                 * @param values an object {name: value, ...} where value is a number, array, or an object
                                 *        {unit: i, texture: t} for binding a texture to a unit and sampler2D.
                                 * @returns {GLUUniforms} this
                                 */

              }, {
                key: 'set',
                value: function set (values) {
                  Object.keys(values).forEach(function (name) {
                    return assign(name, values[name])
                  })
                  return this
                }
              }])

              return GLUUniforms
            }())()
          }

                    /**
                     * @param {WebGLProgram} program
                     * @returns {GLUAttribs}
                     */

        }, {
          key: 'attribs',
          value: function attribs (program) {
            var _decls2 = {},
              count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
            _.range(count).map(function (i) {
                            // console.log('-a-', gl.getActiveAttrib(program, i))
              return gl.getActiveAttrib(program, i)
            }).filter(function (e) {
              return !!e
            }).forEach(function (e) {
              var location = gl.getAttribLocation(program, e.name)
                            // console.log('e.name', e.name)
              _decls2[e.name] = { name: e.name, type: e.type, size: e.size, location: location }
            })

            function assign (name, data) {
                            // console.log('-y-', name, data)
              var decl = _decls2[name] || {},
                loc = decl.location
                            // console.log('-z-', decl, loc )
              gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
              gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
              gl.enableVertexAttribArray(loc)
                            // console.log('assign', name, decl.type)
              switch (decl.type) {
                case gl.FLOAT_VEC2:
                  return gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
                default:
                  console.log("attribute '" + name + "' has unsupported type: " + JSON.stringify(decl))
              }
            }

            return new (function () {
              function GLUAttribs () {
                _classCallCheck(this, GLUAttribs)
              }

              _createClass(GLUAttribs, [{
                key: 'decls',
                value: function decls () {
                  return _decls2
                }

                                /**
                                 * @param values an object {name: value, ...} where value is an array.
                                 * @returns {GLUAttribs} this
                                 */

              }, {
                key: 'set',
                value: function set (values) {
                  Object.keys(values).forEach(function (name) {
                                        // console.log('-x-', name, values[name])
                    return assign(name, values[name])
                  })
                  return this
                }
              }])

              return GLUAttribs
            }())()
          }

                    /**
                     * @param {Object} def texture definition
                     * @returns {WebGLTexture}
                     */

        }, {
          key: 'makeTexture2D',
          value: function makeTexture2D (def) {
            var texture = gl.createTexture()
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)

            var opt = _.extend({}, defaultPixelStore, defaultTexParams, def)
            var format = opt.format,
              type = opt.type,
              width = opt.width,
              height = opt.height,
              data = opt.data

            defaultPixelStoreKeys.forEach(function (key) {
              return gl.pixelStorei(gl[key], opt[key])
            })
                        // console.log('test', defaultPixelStoreKeys)
                        // console.log('-----data-----',  0, format, width, height, 0, format, type, data)
                        // if( format === 6410 ) format = 6409
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data)
            defaultTexParamKeys.forEach(function (key) {
              return gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key])
            })

            gl.bindTexture(gl.TEXTURE_2D, null)
                        // console.log('texture', texture)
            return texture
          }

                    /**
                     * @param {WebGLTexture} texture
                     * @param {Object} def texture definition
                     */

        }, {
          key: 'updateTexture2D',
          value: function updateTexture2D (texture, def) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)

            var opt = _.extend({}, defaultPixelStore, defaultTexParams, def)
            var format = opt.format,
              type = opt.type,
              width = opt.width,
              height = opt.height,
              data = opt.data

            defaultPixelStoreKeys.forEach(function (key) {
              return gl.pixelStorei(gl[key], opt[key])
            })
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, format, type, data)
            defaultTexParamKeys.forEach(function (key) {
              return gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key])
            })

            gl.bindTexture(gl.TEXTURE_2D, null)
            return texture
          }

                    /**
                     * @param {WebGLTexture} texture
                     * @param {Object} def texture definition
                     * @param {Object} existing texture entry
                     * @returns {boolean} true if a difference between def and existing was found and applied
                     */

        }, {
          key: 'updateTexture2DParams',
          value: function updateTexture2DParams (texture, def, existing) {
            var changed = false
            for (var i = 0; i < defaultTexParamKeys.length; i++) {
              var key = defaultTexParamKeys[i]
              var defaultValue = defaultTexParams[key]
              var newValue = def[key] || defaultValue
              var oldValue = existing[key] || defaultValue
              if (newValue !== oldValue) {
                if (!changed) {
                  changed = true
                  gl.activeTexture(gl.TEXTURE0)
                  gl.bindTexture(gl.TEXTURE_2D, texture)
                }
                gl.texParameteri(gl.TEXTURE_2D, gl[key], newValue)
              }
            }
            if (changed) {
              gl.bindTexture(gl.TEXTURE_2D, null)
            }
            return changed
          }
        }, {
          key: 'context',

                    /** @returns {WebGLRenderingContext} */
          get: function get () {
            return gl
          }
        }])

        return GLUStick
      }())()
    }
  }])

  return GLU
}())

// module.exports = function () {
//     function GLU() {
//         _classCallCheck(this, GLU);
//     }

//     _createClass(GLU, null, [{
//         key: "createCanvas",

//         /** @returns {HTMLCanvasElement} */
//         value: function createCanvas() {
//             var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
//             var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

//             var result = /** @type {HTMLCanvasElement} */document.createElement("canvas");
//             result.width = width;
//             result.height = height;
//             return result;
//         }

//         /**
//          * @param {HTMLCanvasElement} canvas DOM element
//          * @param {Object} [attributes] WebGL context attributes
//          * @returns {WebGLRenderingContext} the context or undefined if not supported.
//          */

//     }, {
//         key: "getWebGL",
//         value: function getWebGL(canvas, attributes) {
//             var ctx = void 0;
//             try {
//                 ctx = canvas.getContext("webgl", attributes);
//             } catch (ignore) {}
//             if (!ctx) {
//                 try {
//                     ctx = canvas.getContext("experimental-webgl", attributes);
//                 } catch (ignore) {}
//             }
//             return (/** @type {WebGLRenderingContext} */ctx
//             );
//         }

//         /** @returns {string} */

//     }, {
//         key: "planeVertexShader",
//         value: function planeVertexShader() {
//             return "precision highp float;\n\nattribute vec2 a_Position;\nattribute vec2 a_TexCoord;\n\nvarying vec2 v_TexCoord;\n\nvoid main() {\n    gl_Position = vec4(a_Position, 0.0, 1.0);\n    v_TexCoord = a_TexCoord;\n}\n";
//         }
//     }, {
//         key: "unitPlaneAttributes",
//         value: function unitPlaneAttributes() {
//             return {
//                 a_Position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
//                 a_TexCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
//             };
//         }

//         /**
//          * @param {WebGLRenderingContext} gl
//          * @returns {GLUStick}
//          */

//     }, {
//         key: "attach",
//         value: function attach(gl) {

//             var defaultPixelStore = {
//                 PACK_ALIGNMENT: 1,
//                 UNPACK_ALIGNMENT: 1,
//                 UNPACK_FLIP_Y_WEBGL: false,
//                 UNPACK_PREMULTIPLY_ALPHA_WEBGL: false,
//                 UNPACK_COLORSPACE_CONVERSION_WEBGL: gl.BROWSER_DEFAULT_WEBGL
//             };

//             var defaultPixelStoreKeys = Object.keys(defaultPixelStore);

//             var defaultTexParams = {
//                 TEXTURE_MIN_FILTER: gl.NEAREST,
//                 TEXTURE_MAG_FILTER: gl.NEAREST,
//                 TEXTURE_WRAP_S: gl.CLAMP_TO_EDGE,
//                 TEXTURE_WRAP_T: gl.CLAMP_TO_EDGE
//             };

//             var defaultTexParamKeys = Object.keys(defaultTexParams);

//             return new (function () {
//                 function GLUStick() {
//                     _classCallCheck(this, GLUStick);
//                 }

//                 _createClass(GLUStick, [{
//                     key: "makeShader",

//                     /**
//                      * @param {number} type either VERTEX_SHADER or FRAGMENT_SHADER.
//                      * @param {string} source shader source code.
//                      * @param {Function} [ƒerr] ƒ(err) invoked when an error occurs.
//                      * @returns {WebGLShader} the shader object, or null if the shader could not be compiled.
//                      */
//                     value: function makeShader(type, source) {
//                         var ƒerr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : throwOnErr;

//                         var shader = gl.createShader(type);
//                         gl.shaderSource(shader, source);
//                         gl.compileShader(shader);
//                         if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//                             var message = gl.getShaderInfoLog(shader);
//                             gl.deleteShader(shader);
//                             ƒerr(message);
//                             return null;
//                         }
//                         return shader;
//                     }

//                     /**
//                      * @param {WebGLShader[]} shaders the compiled shaders.
//                      * @param {Function} [ƒerr] ƒ(err) invoked when an error occurs.
//                      * @returns {WebGLProgram} the program, or null if the program could not be linked.
//                      */

//                 }, {
//                     key: "makeProgram",
//                     value: function makeProgram(shaders) {
//                         var ƒerr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : throwOnErr;

//                         var program = gl.createProgram();
//                         shaders.forEach(function (shader) {
//                             return gl.attachShader(program, shader);
//                         });
//                         gl.linkProgram(program);
//                         if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//                             var message = gl.getProgramInfoLog(program);
//                             gl.deleteProgram(program);
//                             ƒerr(message);
//                             return null;
//                         }
//                         return program;
//                     }

//                     /**
//                      * @param {WebGLTexture} texture 2d texture
//                      * @param {Function} [callback] ƒ(err) invoked when an error occurs.
//                      * @returns {WebGLFramebuffer} the framebuffer, or null if the framebuffer is not complete.
//                      */

//                 }, {
//                     key: "makeFramebufferTexture2D",
//                     value: function makeFramebufferTexture2D(texture) {
//                         var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : throwOnErr;

//                         var framebuffer = gl.createFramebuffer();
//                         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//                         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
//                         var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
//                         if (status !== gl.FRAMEBUFFER_COMPLETE) {
//                             gl.deleteFramebuffer(framebuffer);
//                             callback("framebuffer: " + status);
//                             return null;
//                         }
//                         return framebuffer;
//                     }

//                     /**
//                      * @param {WebGLProgram} program
//                      * @param {Object} textures map from name to texture entry
//                      * @returns {GLUUniforms}
//                      */

//                 }, {
//                     key: "uniforms",
//                     value: function uniforms(program, textures) {
//                         var decls = {},
//                             count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
//                         _.range(count).map(function (i) {
//                             return gl.getActiveUniform(program, i);
//                         }).filter(function (e) {
//                             return !!e;
//                         }).forEach(function (e) {
//                             var location = gl.getUniformLocation(program, e.name);
//                             decls[e.name] = { name: e.name, type: e.type, size: e.size, location: location };
//                         });

//                         function assign(name, v) {
//                             var decl = decls[name] || {},
//                                 loc = decl.location;
//                             // log.debug(`uniform ${name}: ${v}`);
//                             switch (decl.type) {
//                                 case gl.FLOAT:
//                                     return µ.isArrayLike(v) ? gl.uniform1fv(loc, v) : gl.uniform1f(loc, v);
//                                 case gl.FLOAT_VEC2:
//                                     return gl.uniform2fv(loc, v);
//                                 case gl.FLOAT_VEC3:
//                                     return gl.uniform3fv(loc, v);
//                                 case gl.FLOAT_VEC4:
//                                     return gl.uniform4fv(loc, v);
//                                 case gl.INT:
//                                     return µ.isArrayLike(v) ? gl.uniform1iv(loc, v) : gl.uniform1i(loc, v);
//                                 case gl.INT_VEC2:
//                                     return gl.uniform2iv(loc, v);
//                                 case gl.INT_VEC3:
//                                     return gl.uniform3iv(loc, v);
//                                 case gl.INT_VEC4:
//                                     return gl.uniform4iv(loc, v);
//                                 case gl.SAMPLER_2D:
//                                     {
//                                         var entry = textures[v];
//                                         if (!entry) {
//                                             console.log("uniform '" + name + "' refers to unknown texture '" + v + "'");
//                                             return;
//                                         }
//                                         gl.uniform1i(loc, entry.unit);
//                                         return;
//                                     }
//                                 default:
//                                     console.log("uniform '" + name + "' is '" + decl.type + "'");
//                             }
//                         }

//                         return new (function () {
//                             function GLUUniforms() {
//                                 _classCallCheck(this, GLUUniforms);
//                             }

//                             _createClass(GLUUniforms, [{
//                                 key: "set",

//                                 /**
//                                  * @param values an object {name: value, ...} where value is a number, array, or an object
//                                  *        {unit: i, texture: t} for binding a texture to a unit and sampler2D.
//                                  * @returns {GLUUniforms} this
//                                  */
//                                 value: function set(values) {
//                                     Object.keys(values).forEach(function (name) {
//                                         return assign(name, values[name]);
//                                     });
//                                     return this;
//                                 }
//                             }]);

//                             return GLUUniforms;
//                         }())();
//                     }

//                     /**
//                      * @param {WebGLProgram} program
//                      * @returns {GLUAttribs}
//                      */

//                 }, {
//                     key: "attribs",
//                     value: function attribs(program) {
//                         var decls = {},
//                             count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
//                         _.range(count).map(function (i) {
//                             return gl.getActiveAttrib(program, i);
//                         }).filter(function (e) {
//                             return !!e;
//                         }).forEach(function (e) {
//                             var location = gl.getAttribLocation(program, e.name);
//                             decls[e.name] = { name: e.name, type: e.type, size: e.size, location: location };
//                         });

//                         function assign(name, data) {
//                             var decl = decls[name] || {},
//                                 loc = decl.location;
//                             gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
//                             gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
//                             gl.enableVertexAttribArray(loc);
//                             switch (decl.type) {
//                                 case gl.FLOAT_VEC2:
//                                     return gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
//                                 default:
//                                     console.log("attribute '" + name + "' is '" + decl.type + "'");
//                             }
//                         }

//                         return new (function () {
//                             function GLUAttribs() {
//                                 _classCallCheck(this, GLUAttribs);
//                             }

//                             _createClass(GLUAttribs, [{
//                                 key: "set",

//                                 /**
//                                  * @param values an object {name: value, ...} where value is an array.
//                                  * @returns {GLUAttribs} this
//                                  */
//                                 value: function set(values) {
//                                     Object.keys(values).forEach(function (name) {
//                                         return assign(name, values[name]);
//                                     });
//                                     return this;
//                                 }
//                             }]);

//                             return GLUAttribs;
//                         }())();
//                     }

//                     /**
//                      * @param {Object} def texture definition
//                      * @returns {WebGLTexture}
//                      */

//                 }, {
//                     key: "makeTexture2D",
//                     value: function makeTexture2D(def) {
//                         var texture = gl.createTexture();
//                         gl.activeTexture(gl.TEXTURE0);
//                         gl.bindTexture(gl.TEXTURE_2D, texture);

//                         var opt = _.extend({}, defaultPixelStore, defaultTexParams, def);
//                         var format = opt.format;
//                         var type = opt.type;
//                         var width = opt.width;
//                         var height = opt.height;
//                         var data = opt.data;

//                         defaultPixelStoreKeys.forEach(function (key) {
//                             return gl.pixelStorei(gl[key], opt[key]);
//                         });
//                         gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
//                         defaultTexParamKeys.forEach(function (key) {
//                             return gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key]);
//                         });

//                         gl.bindTexture(gl.TEXTURE_2D, null);
//                         return texture;
//                     }

//                     /**
//                      * @param {WebGLTexture} texture
//                      * @param {Object} def texture definition
//                      */

//                 }, {
//                     key: "updateTexture2D",
//                     value: function updateTexture2D(texture, def) {
//                         gl.activeTexture(gl.TEXTURE0);
//                         gl.bindTexture(gl.TEXTURE_2D, texture);

//                         var opt = _.extend({}, defaultPixelStore, defaultTexParams, def);
//                         var format = opt.format;
//                         var type = opt.type;
//                         var width = opt.width;
//                         var height = opt.height;
//                         var data = opt.data;

//                         defaultPixelStoreKeys.forEach(function (key) {
//                             return gl.pixelStorei(gl[key], opt[key]);
//                         });
//                         gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, format, type, data);
//                         defaultTexParamKeys.forEach(function (key) {
//                             return gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key]);
//                         });

//                         gl.bindTexture(gl.TEXTURE_2D, null);
//                         return texture;
//                     }

//                     /**
//                      * @param {WebGLTexture} texture
//                      * @param {Object} def texture definition
//                      * @param {Object} existing texture entry
//                      * @returns {boolean} true if a difference between def and existing was found and applied
//                      */

//                 }, {
//                     key: "updateTexture2DParams",
//                     value: function updateTexture2DParams(texture, def, existing) {
//                         var changed = false;
//                         for (var i = 0; i < defaultTexParamKeys.length; i++) {
//                             var key = defaultTexParamKeys[i];
//                             var defaultValue = defaultTexParams[key];
//                             var newValue = def[key] || defaultValue;
//                             var oldValue = existing[key] || defaultValue;
//                             if (newValue !== oldValue) {
//                                 if (!changed) {
//                                     changed = true;
//                                     gl.activeTexture(gl.TEXTURE0);
//                                     gl.bindTexture(gl.TEXTURE_2D, texture);
//                                 }
//                                 gl.texParameteri(gl.TEXTURE_2D, gl[key], newValue);
//                             }
//                         }
//                         if (changed) {
//                             gl.bindTexture(gl.TEXTURE_2D, null);
//                         }
//                         return changed;
//                     }
//                 }, {
//                     key: "context",

//                     /** @returns {WebGLRenderingContext} */
//                     get: function get() {
//                         return gl;
//                     }
//                 }]);

//                 return GLUStick;
//             }())();
//         }
//     }]);

//     return GLU;
// }();
