/**
 * globes - a set of models of the earth, each having their own kind of projection and onscreen behavior.
 *
 * Copyright (c) 2016 Cameron Beccario
 *
 * For a free version of this project, see https://github.com/cambecc/earth
 */
!(function () {
  'use strict'

  var globes = module.exports = {}

  var d3 = require('d3')
  var _ = require('underscore')
  var µ = {}
  µ.clamp = function (x, low, high) {
    return Math.max(low, Math.min(x, high))
  }
  µ.floorMod = function (a, n) {
    var f = a - n * Math.floor(a / n)
        // When a is within an ulp of n, f can be equal to n (because the subtraction has no effect). But the result
        // should be in the range [0, n), so check for this case. Example: floorMod(-1e-16, 10)
    return f === n ? 0 : f
  }
  var ortho = require('./orthographic')

    /**
     * @returns {Array} rotation of globe to current position of the user. Aside from asking for geolocation,
     *          which user may reject, there is not much available except timezone. Better than nothing.
     */
  function currentPosition () {
    var λ = µ.floorMod(new Date().getTimezoneOffset() / 4, 360) // 24 hours * 60 min / 4 === 360 degrees
    return [λ, 0]
  }

  function ensureNumber (num, fallback) {
    return _.isFinite(num) || num === Infinity || num === -Infinity ? num : fallback
  }

    /**
     * @param bounds the projection bounds: [[x0, y0], [x1, y1]]
     * @param view the view bounds {width:, height:}
     * @returns {Object} the projection bounds clamped to the specified view.
     */
  function clampedBounds (bounds, view) {
    var upperLeft = bounds[0]
    var lowerRight = bounds[1]
    var x = Math.max(Math.floor(ensureNumber(upperLeft[0], 0)), 0)
    var y = Math.max(Math.floor(ensureNumber(upperLeft[1], 0)), 0)
    var xMax = Math.min(Math.ceil(ensureNumber(lowerRight[0], view.width)), view.width - 1)
    var yMax = Math.min(Math.ceil(ensureNumber(lowerRight[1], view.height)), view.height - 1)
    return { x: x, y: y, xMax: xMax, yMax: yMax, width: xMax - x + 1, height: yMax - y + 1 }
  }

  function fitProjection (proj, view, center) {
    var bounds = d3.geo.path().projection(proj).bounds({ type: 'Sphere' })
    var hScale = (bounds[1][0] - bounds[0][0]) / proj.scale()
    var vScale = (bounds[1][1] - bounds[0][1]) / proj.scale()
    var fit = Math.min(view.width / hScale, view.height / vScale) * 1
    if (!center) {
      center = [view.width / 2, view.height / 2]
    }
    return proj.scale(fit).translate(center)
  }

    /**
     * Returns a globe object with standard behavior. At least the newProjection method must be overridden to
     * be functional.
     */
  function standardGlobe () {
    return {
            /**
             * This globe's current D3 projection.
             */
      projection: null,

            /**
             * @param view the size of the view as {width:, height:}.
             * @returns {Object} a new D3 projection of this globe appropriate for the specified view port.
             */
      newProjection: function newProjection (view) {
        throw new Error('method must be overridden')
      },

            /**
             * Hand-optimized projection if available, otherwise the normal d3 projection.
             */
      optimizedProjection: function optimizedProjection () {
        return this.projection
      },

            /**
             * @param view the size of the view as {width:, height:}.
             * @returns {{x: Number, y: Number, xMax: Number, yMax: Number, width: Number, height: Number}}
             *          the bounds of the current projection clamped to the specified view.
             */
      bounds: function bounds (view) {
        return clampedBounds(d3.geo.path().projection(this.projection).bounds({ type: 'Sphere' }), view)
      },

            /**
             * @param view the size of the view as {width:, height:}.
             * @returns {Number} the projection scale at which the entire globe fits within the specified view.
             */
      fit: function fit (view) {
                // if (µ.isEmbeddedInIFrame() && µ.siteInstance() === "tara") {
                //     return 700; // HACK: to get things the right size in the iframe.
                // }
        return this.newProjection(view).scale()
      },

            /**
             * @param view the size of the view as {width:, height:}.
             * @returns {Array} the projection transform at which the globe is centered within the specified view.
             */
      center: function center (view) {
        return [view.width / 2, view.height / 2]
      },

            /**
             * @returns {Array} the range at which this globe can be zoomed.
             */
      scaleExtent: function scaleExtent () {
        return [100, 3000]
      },

            /**
             * Returns the current orientation of this globe as a string. If the arguments are specified,
             * mutates this globe to match the specified orientation string, usually in the form "lat,lon,scale".
             *
             * @param [o] the orientation string
             * @param [view] the size of the view as {width:, height:}.
             */
      orientation: function orientation (o, view) {
        var projection = this.projection,
          rotate = projection.rotate()
        if (view) {
          var parts = _.isString(o) ? o.split(',') : []
          var λ = +parts[0],
            φ = +parts[1],
            scale = +parts[2]
          var extent = this.scaleExtent()
          projection.rotate(_.isFinite(λ) && _.isFinite(φ) ? [-λ, -φ, rotate[2]] : this.newProjection(view).rotate())
          projection.scale(_.isFinite(scale) ? µ.clamp(scale, extent[0], extent[1]) : this.fit(view))
          projection.translate(this.center(view))
          return this
        }
        return [(-rotate[0]).toFixed(2), (-rotate[1]).toFixed(2), Math.round(projection.scale())].join(',')
      },

            /**
             * Returns an object that mutates this globe's current projection during a drag/zoom operation.
             * Each drag/zoom event invokes the move() method, and when the move is complete, the end() method
             * is invoked.
             *
             * @param startMouse starting mouse position.
             * @param startScale starting scale.
             */
      manipulator: function manipulator (startMouse, startScale) {
        var projection = this.projection
        var sensitivity = 60 / startScale // seems to provide a good drag scaling factor
        var rotation = [projection.rotate()[0] / sensitivity, -projection.rotate()[1] / sensitivity]
        var original = projection.precision()
        projection.precision(original * 10)
        return {
          move: function move (mouse, scale) {
            if (mouse) {
              var xd = mouse[0] - startMouse[0] + rotation[0]
              var yd = mouse[1] - startMouse[1] + rotation[1]
              projection.rotate([xd * sensitivity, -yd * sensitivity, projection.rotate()[2]])
            }
            projection.scale(scale)
          },
          end: function end () {
            projection.precision(original)
          }
        }
      },

            /**
             * @returns {Array} the transform to apply, if any, to orient this globe to the specified coordinates.
             */
      locate: function locate (coord) {
        return null
      },

            /**
             * Draws a polygon on the specified context of this globe's boundary.
             * @param context a Canvas element's 2d context.
             * @returns the context
             */
      defineMask: function defineMask (context) {
        d3.geo.path().projection(this.projection).context(context)({ type: 'Sphere' })
        return context
      },

            /**
             * Appends the SVG elements that render this globe.
             * @param mapSvg the primary map SVG container.
             * @param foregroundSvg the foreground SVG container.
             */
      defineMap: function defineMap (mapSvg, foregroundSvg) {
        var path = d3.geo.path().projection(this.projection)
        var defs = mapSvg.append('defs')
        defs.append('path').attr('id', 'sphere').datum({ type: 'Sphere' }).attr('d', path)
        var mask = defs.append('mask').attr('id', 'mask')
        mask.append('rect').attr('fill', 'white').attr('width', '100%').attr('height', '100%')
        mask.append('use').attr('xlink:href', '#sphere')
        mapSvg.append('use').classed('background-sphere', true).attr('xlink:href', '#sphere')
        mapSvg.append('path').classed('graticule', true).datum(d3.geo.graticule()).attr('d', path)
        mapSvg.append('path').classed('hemisphere', true).datum(d3.geo.graticule().minorStep([0, 90]).majorStep([0, 90])).attr('d', path)
        mapSvg.append('path').classed('coastline', true)
        mapSvg.append('path').classed('lakes', true)
        mapSvg.append('path').classed('rivers', true)
        foregroundSvg.append('use').classed('foreground-sphere', true).attr('xlink:href', '#sphere')
      },
      beforeMove: function beforeMove (mapSvg, foregroundSvg) {
                // Remove SVG elements that make move animation too slow.
        foregroundSvg.selectAll('#atmos').remove()
      },
      afterMove: function afterMove (mapSvg, foregroundSvg) {
        foregroundSvg.append('use').classed('foreground-sphere', true).attr('xlink:href', '#sphere').attr('id', 'atmos').attr('mask', 'url(#mask)')
      }
    }
  }

  function newGlobe (source, view) {
    var result = _.extend(standardGlobe(), source)
    result.projection = result.newProjection(view)
    return result
  }

    // ============================================================================================

  globes.atlantis = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.mollweide().rotate([30, -45, 90]).precision(0.1), view)
      }
    }, view)
  }

  globes.azimuthal_equidistant = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.azimuthalEquidistant().precision(0.1).rotate([0, -90]).clipAngle(180 - 0.001), view)
      }
    }, view)
  }

  globes.conic_equidistant = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.conicEquidistant().rotate(currentPosition()).precision(0.1), view, [view.width / 2, view.height / 2 + view.height * 0.065])
      },
      center: function center (view) {
        return [view.width / 2, view.height / 2 + view.height * 0.065]
      }
    }, view)
  }

  globes.equirectangular = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.equirectangular().rotate(currentPosition()).precision(0.1), view)
      }
    }, view)
  }

  globes.orthographic = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.orthographic().rotate(currentPosition()).precision(0.1).clipAngle(90), view)
      },
      optimizedProjection: function optimizedProjection () {
        return ortho.fromD3(this.projection)
      },
      defineMap: function defineMap (mapSvg, foregroundSvg) {
        var path = d3.geo.path().projection(this.projection)
        var defs = mapSvg.append('defs')
        var gradientFill = defs.append('radialGradient').attr('id', 'orthographic-fill').attr('gradientUnits', 'objectBoundingBox').attr('cx', '50%').attr('cy', '49%').attr('r', '50%')
        gradientFill.append('stop').attr('stop-color', '#303030').attr('offset', '69%')
        gradientFill.append('stop').attr('stop-color', '#202020').attr('offset', '91%')
        gradientFill.append('stop').attr('stop-color', '#000005').attr('offset', '96%')
        defs.append('path').attr('id', 'sphere').datum({ type: 'Sphere' }).attr('d', path)
        var mask = defs.append('mask').attr('id', 'mask')
        mask.append('rect').attr('fill', 'white').attr('width', '100%').attr('height', '100%')
        mask.append('use').attr('xlink:href', '#sphere')
        mapSvg.append('use').attr('xlink:href', '#sphere').attr('fill', 'url(#orthographic-fill)')
        mapSvg.append('path').classed('graticule', true).datum(d3.geo.graticule()).attr('d', path)
        mapSvg.append('path').classed('hemisphere', true).datum(d3.geo.graticule().minorStep([0, 90]).majorStep([0, 90])).attr('d', path)
        mapSvg.append('path').classed('coastline', true)
        mapSvg.append('path').classed('lakes', true)
        mapSvg.append('path').classed('rivers', true)
        foregroundSvg.append('use').classed('foreground-sphere', true).attr('xlink:href', '#sphere')
      },
      locate: function locate (coord) {
        return [-coord[0], -coord[1], this.projection.rotate()[2]]
      }
    }, view)
  }

  globes.patterson = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.patterson().precision(0.1), view)
      }
    }, view)
  }

  globes.stereographic = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.stereographic().rotate([-43, -20]).precision(1.0).clipAngle(180 - 0.0001).clipExtent([[0, 0], [view.width, view.height]]), view)
      }
    }, view)
  }

  globes.waterman = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.polyhedron.waterman().rotate([20, 0]).precision(0.1), view)
      },
      defineMap: function defineMap (mapSvg, foregroundSvg) {
        var path = d3.geo.path().projection(this.projection)
        var defs = mapSvg.append('defs')
        defs.append('path').attr('id', 'sphere').datum({ type: 'Sphere' }).attr('d', path)
        defs.append('clipPath').attr('id', 'clip').append('use').attr('xlink:href', '#sphere')
        var mask = defs.append('mask').attr('id', 'mask')
        mask.append('rect').attr('fill', 'white').attr('width', '100%').attr('height', '100%')
        mask.append('use').attr('xlink:href', '#sphere')
        mapSvg.append('use').classed('background-sphere', true).attr('xlink:href', '#sphere')
        mapSvg.append('path').classed('graticule', true).attr('clip-path', 'url(#clip)').datum(d3.geo.graticule()).attr('d', path)
        mapSvg.append('path').classed('coastline', true).attr('clip-path', 'url(#clip)')
        mapSvg.append('path').classed('lakes', true).attr('clip-path', 'url(#clip)')
        mapSvg.append('path').classed('rivers', true).attr('clip-path', 'url(#clip)')
        foregroundSvg.append('use').classed('foreground-sphere', true).attr('xlink:href', '#sphere')
      }
    }, view)
  }

  globes.winkel3 = function (view) {
    return newGlobe({
      newProjection: function newProjection (view) {
        return fitProjection(d3.geo.winkel3().precision(0.1), view)
      }
    }, view)
  }
}())
