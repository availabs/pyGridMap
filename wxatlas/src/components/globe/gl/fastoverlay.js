'use strict'

var d3 = require('d3')
var _ = require('underscore')
var GLU = require('./glu')
var µ = {}
µ.arraysEq = function (a, b) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return a.length === b.length
}
µ.view = function () {
  var w = window
  var d = document && document.documentElement
  var b = document && document.getElementsByTagName('body')[0]
  var x = w.innerWidth || d.clientWidth || b.clientWidth
  var y = w.innerHeight || d.clientHeight || b.clientHeight
  return { width: Math.ceil(x), height: Math.ceil(y) }
}
var display = µ.view()

var header = 'precision highp float;\nprecision highp sampler2D;\n\nconst float TAU = 6.283185307179586;\nconst float PI = 3.141592653589793;\n'
var main = '\nuniform float u_Detail;\n\nvoid main() {\n    vec2 coord = invert(gl_FragCoord.xy / u_Detail);\n    vec2 st = grid(coord);\n    float v = lookup(st);\n    lowp vec4 color = colorize(v);\n    gl_FragColor = color;\n}\n'

/**
 * @param {HTMLCanvasElement} canvas
 * @param configuration
 * @param globeAgent
 * @param gridAgent
 * @param rendererAgent
 * @param animatorAgent
 * @returns {*}
 */
module.exports = function (canvas) { // configuration, globeAgent, gridAgent, rendererAgent, animatorAgent
    // Draw webgl offscreen then copy to 2d canvas. Reduces jank, especially on iOS, during compositing of different
    // layers at the expense of some performance. Better way?
  var useIntermediateBuffer = true

  var container = useIntermediateBuffer ? GLU.createCanvas() : canvas
  var targetCtx = useIntermediateBuffer ? canvas.getContext('2d') : undefined
  var canvases = d3.selectAll([canvas, container]).style('width', display.width + 'px').style('height', display.height + 'px')

  var gl = GLU.getWebGL(container)
  var glu = GLU.attach(gl)
  gl.getExtension('OES_texture_float')
  gl.getExtension('OES_texture_float_linear')
  gl.disable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0)

  var vertexShader = glu.makeShader(gl.VERTEX_SHADER, GLU.planeVertexShader())

  var textures = {} // registry of textures used by webgl components, by name
  var units = _.range(8).map(function () {
    return null
  }) // a[i] -> texture, where i is unit index. webgl 1.0 guarantees 8 units
  var currentUnit = 1 // next available texture unit
  var currentSources = [] // sources of current program
  var currentProgram = null // program to run
  var currentUniforms = null // uniform assigner
  var currentWidth = -1 // viewport width
  var currentHeight = -1 // viewport height

    /**
     * Compiles new shaders and sets up unit plane.
     * @param {string[]} newSources
     */
  function buildProgram (newSources) {
    var fragmentShaderSource = header + newSources.join('') + main
    var fragmentShader = glu.makeShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    var newProgram = glu.makeProgram([vertexShader, fragmentShader])
    glu.attribs(newProgram).set(GLU.unitPlaneAttributes())
    currentSources = newSources
    currentProgram = newProgram
    // console.log('textures', textures)
    currentUniforms = glu.uniforms(newProgram, textures)
    gl.useProgram(newProgram)
  }

    /**
     * Applies delta between existing texture settings and new settings.
     * @param def texture definition as specified in GLU
     * @param entry existing texture entry object: {def: {}, texture: WebGLTexture, unit: number}
     * @returns {Object} texture entry object, with reference to "data" removed to allow garbage collection.
     */
  function apply (def, entry) {
    if (entry) {
            // texture entry exists, so let's find what's different
      var existing = entry.def
      if (def.hash === existing.hash) {
                // same data
        if (!glu.updateTexture2DParams(entry.texture, def, existing)) {
          return entry // nothing to do because nothing is different
        }
        return { def: _.omit(def, 'data'), texture: entry.texture }
      }
            // pixels are different
      if (def.width === existing.width && def.height === existing.height && def.format === existing.format && def.type === existing.type) {
                // but data is the same shape, so can reuse this texture
        glu.updateTexture2D(entry.texture, def)
        return { def: _.omit(def, 'data'), texture: entry.texture }
      }
            // replace texture with a new one
      gl.deleteTexture(entry.texture)
    }
        // create new texture
        // console.log('testing texture', def, def.format, def.format.type)
        // if (def.format === 6410) {
        //     def.format = 6409
        //     def.data = def.data.map(d => d / 500 )
        // }

    var texture = glu.makeTexture2D(def)
        // console.log('texture2', texture)
    return { def: _.omit(def, 'data'), texture: texture }
  }

    /**
     * @param {Object} defs creates or updates texture entries for each specified texture definition
     * @returns {string[]} names of the texture entries
     */
  function registerTextures (defs) {
    return Object.keys(defs).map(function (name) {
      return textures[name] = apply(defs[name], textures[name])
    })
  }

    /**
     * Sequentially assigns and binds textures to texture units.
     * @param {Object[]} entries the texture entries to bind.
     */
  function bindTextures (entries) {
    entries.forEach(function (entry) {
      var texture = entry.texture
            // check if already bound to the current unit
      if (units[currentUnit] !== texture) {
        units[currentUnit] = texture
        gl.activeTexture(gl.TEXTURE0 + currentUnit)
        gl.bindTexture(gl.TEXTURE_2D, texture)
      }
      entry.unit = currentUnit++
    })
  }

    /**
     * Get the webgl components that are currently renderable.
     * @returns {Object[]} an array of webgl components, or undefined if a component describes itself as non-renderable.
     */
  function collectComponents (projection, product) {
    var myImposter = {}
        // {bounds: , colors: }
         //   Object.defineProperty(myImposter, 'bounds', [0, 100])
         //   Object.defineProperty(myImposter, 'colors', new Uint8Array(length).map(d => Math.floor(Math.random() * (0 - 255 + 1))))
    var factories = [
      projection,
      product.grid && product.grid(),
      product.field && product.field()['bilinear'],
      product.scale
    ]

        // console.log('factories', factories)
    return factories.map(function () {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
            // console.log('5', e.webgl)
      return e['webgl'] && e.webgl(glu) // does it have a webgl() function? if so, then supports webgl.
    })
  }

    /**
     * Adjust size of drawingbuffer (i.e., viewport) to match desired view and detail settings.
     * @param {number} detail ratio of drawing buffer to display size.
     */
  function adjustViewport (detail) {
    var newWidth = Math.round(display.width * detail)
    var newHeight = Math.round(display.height * detail)
    if (currentWidth !== newWidth || currentHeight !== newHeight) {
      canvases.attr('width', newWidth).attr('height', newHeight)
      gl.viewport(0, 0, newWidth, newHeight)
      currentWidth = newWidth
      currentHeight = newHeight
    }
  }

  function clear () {
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (targetCtx) {
      targetCtx.clearRect(0, 0, currentWidth, currentHeight)
    }
  }

  var controller = {

        /**
         * Render a frame.
         *
         * @returns {boolean} true if current components support webgl, otherwise false (to then be handled by 2d).
         */
    draw: function draw (projection, grids) {
      var detail = 1.0// configuration.get("hd") ? 1.0 : 0.5;
      adjustViewport(detail)

      clear()

            // if we're just downloading and interpolating a new grid, and animation is turned on, then we don't want to
            // adjust the alpha.
            // console.log('--------------------------------')
      var renderer = 'ready'
            // console.log('renderer',renderer)
            // var product = (gridAgent.value() || {}).overlayGrid;
            // console.log('product', product)
      var overlayType = 'stuff'// configuration.get("overlayType");
            // console.log('overlayType', overlayType)
      var animate = false // configuration.get("animate"); // !!animatorAgent.value();\
            // console.log('animate', animate)
      var components = collectComponents(projection, grids)
            // console.log('components', components, components.length)

      if (overlayType === 'off' || !renderer || components.some(function (e) {
        return e === undefined
      })) {
                // Either we aren't supposed to draw anything, or some of the components do not yet support webgl.
        console.log('no go')
        return false
      }

            // Check if we should change the program.
      var newSources = _.flatten(components.map(function (c) {
        return c.shaderSource()
      }))

      if (!µ.arraysEq(currentSources, newSources)) {
                // console.log('-------------------new sources-----------------------\n', newSources)
        buildProgram(newSources)
      }

            // Bind textures needed for this frame to available units. Just sequentially assign from 1.
      currentUnit = 1
      components.forEach(function (c, i) {
                // console.log('c', i, c.textures())
        return bindTextures(registerTextures(c.textures()))
      })
      while (currentUnit < units.length) {
        units[currentUnit++] = null // clear out unused units to release their texture objects.
      }

            // Ask each component to assign uniforms.
      components.forEach(function (c) {
        return currentUniforms.set(c.uniforms())
      })

      currentUniforms.set({
        u_Detail: detail,
                // HACK: set alpha based on current state of animating particles.
                //       should this instead by handled by the palette component?
                // console.log()
        u_Alpha: 2
                // (animate ? product.alpha.animated : product.alpha.single) / 255
      })
            // console.log('detail',detail)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (useIntermediateBuffer) {
        targetCtx.drawImage(container, 0, 0)
      }

      return true
    },

        /**
         * Apply new display size.
         * @param {{width: number, height: number}} newDisplay
         */
    changeDisplaySize: function changeDisplaySize (newDisplay) {
      canvases.style('width', newDisplay.width + 'px').style('height', newDisplay.height + 'px')
      display = newDisplay // The viewport will be automatically adjusted during the next draw.
    }
  }

    // All of these events trigger a new frame.
    // configuration.on("change:overlayType", controller.draw);
    // configuration.on("change:hd", controller.draw);
    // globeAgent.on("update", controller.draw);
    // gridAgent.on("update", controller.draw);
    // rendererAgent.on("redraw", controller.draw);
    // rendererAgent.on("render", controller.draw);
    // animatorAgent.on("update", controller.draw);

  return controller
}
