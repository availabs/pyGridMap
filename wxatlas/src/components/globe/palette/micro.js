'use strict'

var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) { return typeof obj } : function (obj) { return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj }

/**
 * micro - a grab bag of somewhat useful utility functions and other stuff that requires unit testing
 *
 * Copyright (c) 2016 Cameron Beccario
 *
 * For a free version of this project, see https://github.com/cambecc/earth
 */

!(function () {
  'use strict'

  var µ = module.exports = {}

  var d3 = require('d3')
  var _ = require('underscore')

  var π = Math.PI,
    τ = 2 * π,
    /* DEG = 360 / τ, */RAD = τ / 360
  var H = 0.0000360 // 0.0000360°φ ~= 4m
  var DEFAULT_CONFIG = 'current/wind/surface/level/orthographic'

  function topologyFile () {
    return µ.isMobile() ? '/data/earth-topo-mobile.json?v3' : '/data/earth-topo.json?v3'
  }

  µ.MISSING = 7e37

  µ.isDevMode = function () {
    return +window.location.port === 8081
  }

  µ.siteLangCode = function () {
    return d3.select('html').attr('lang') || 'en'
  }

  µ.siteInstance = function () {
    var match = window.location.hostname.match(/(.*)\.nullschool\.net$/) || [],
      name = match[1] || 'earth'
    return name === 'earth' ? '' : name
  }

    /**
     * @returns {boolean} true if the specified value is truthy.
     */
  µ.isTruthy = function (x) {
    return !!x
  }

    /**
     * @returns {boolean} true if the specified value is not null and not undefined.
     */
  µ.isValue = function (x) {
    return x !== null && x !== undefined
  }

    /**
     * @returns {Object} the first argument if not null and not undefined, otherwise the second argument.
     */
  µ.coalesce = function (a, b) {
    return µ.isValue(a) ? a : b
  }

    /**
     * Converts the argument to a number, including special cases for fractions:
     *     0.25  -> 0.25
     *     "1/4" -> 0.25
     *     [1,4] -> 0.25
     *     ".25" -> 0.25
     *
     * @param x any object. When an array, then interpreted as the fraction: a[0] / a[1]. When a string containing
     *        a slash, the value is first converted to an array by splitting on "/".
     * @returns {number} the specified argument converted to a number.
     */
  µ.decimalize = function (x) {
    if (_.isString(x) && x.indexOf('/') >= 0) {
      x = x.split('/')
    }
    return µ.isArrayLike(x) && x.length === 2 ? x[0] / x[1] : +x
  }

    /**
     * @param {Array|*} x the value to convert to a scalar.
     * @returns {*} the magnitude if x is a vector (i.e., x[2]), otherwise x itself.
     */
  µ.scalarize = function (x) {
    return µ.isArrayLike(x) ? x[2] : x
  }

    /**
     * @returns {number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
     *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
     */
  µ.floorMod = function (a, n) {
    var f = a - n * Math.floor(a / n)
        // When a is within an ulp of n, f can be equal to n (because the subtraction has no effect). But the result
        // should be in the range [0, n), so check for this case. Example: floorMod(-1e-16, 10)
    return f === n ? 0 : f
  }

    /**
     * @returns {number} distance between two points having the form [x, y].
     */
  µ.distance = function (a, b) {
    var Δx = b[0] - a[0]
    var Δy = b[1] - a[1]
    return Math.sqrt(Δx * Δx + Δy * Δy)
  }

    /**
     * @returns {number} the value x clamped to the range [low, high].
     */
  µ.clamp = function (x, low, high) {
    return Math.max(low, Math.min(x, high))
  }

    /**
     * @returns {number} the fraction of the bounds [low, high] covered by the value x, after clamping x to the
     *          bounds. For example, given bounds=[10, 20], this method returns 1 for x>=20, 0.5 for x=15 and 0
     *          for x<=10.
     */
  µ.proportion = function (x, low, high) {
    return (µ.clamp(x, low, high) - low) / (high - low)
  }

    /**
     * @returns {number} the value p within the range [0, 1], scaled to the range [low, high].
     */
  µ.spread = function (p, low, high) {
    return p * (high - low) + low
  }

    /**
     * @returns {string} the specified string with the first letter capitalized.
     */
  µ.capitalize = function (s) {
    return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.substr(1)
  }

    /**
     * @returns {boolean} true if agent is probably firefox. Don't really care if this is accurate.
     */
  µ.isFF = function () {
    return (/firefox/i.test(navigator.userAgent)
    )
  }

    /**
     * @returns {boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
     */
  µ.isMobile = function () {
    return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent)
    )
  }

  µ.isEmbeddedInIFrame = function () {
    return self != top
  }

    /**
     * Finds the method having the specified name on the object thisArg, and returns it as a function bound
     * to thisArg. If no method can be found, or thisArg is not a value, then returns null.
     *
     * @param thisArg the object
     * @param methodName the method name to bind to the object
     * @returns {Function} the method bound to the object, if it exists.
     */
  µ.bindup = function (thisArg, methodName) {
    return µ.isValue(thisArg) && thisArg[methodName] ? thisArg[methodName].bind(thisArg) : null
  }

    /**
     * @returns {{width: number, height: number}} an object that describes the size of the browser's current view.
     */
  µ.view = function () {
    var w = window
    var d = document && document.documentElement
    var b = document && document.getElementsByTagName('body')[0]
    var x = w.innerWidth || d.clientWidth || b.clientWidth
    var y = w.innerHeight || d.clientHeight || b.clientHeight
    return { width: Math.ceil(x), height: Math.ceil(y) }
  }

    /**
     * Removes all children of the specified DOM element.
     */
  µ.removeChildren = function (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

    /**
     * @returns {*} a new mouse click event instance
     */
  µ.newClickEvent = function () {
    try {
      return new MouseEvent('click', { view: window, bubbles: true, cancelable: true })
    } catch (e) {
            // Chrome mobile supports only the old fashioned, deprecated way of constructing events. :(
      var event = document.createEvent('MouseEvents')
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
      return event
    }
  }

    /**
     * @returns {Object} clears and returns the specified Canvas element's 2d context.
     */
  µ.clearCanvas = function (canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    return canvas
  }

    /**
     * @returns {Array} of wind colors and a method, indexFor, that maps wind magnitude to an index on the color scale.
     */
  µ.windIntensityColorScale = function (step, maxWind) {
    var result = []
    for (var j = 85; j <= 255; j += step) {
      result.push('rgb(' + j + ',' + j + ',' + j + ')')
    }
    result.indexFor = function (m) {
            // map wind speed to a style
      return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1))
    }
    return result
  }

    /**
     * Returns a human readable string for the provided coordinates.
     */
  µ.formatCoordinates = function (λ, φ) {
    return Math.abs(φ).toFixed(2) + '° ' + (φ >= 0 ? 'N' : 'S') + ', ' + Math.abs(λ).toFixed(2) + '° ' + (λ >= 0 ? 'E' : 'W')
  }

    /**
     * Returns a human readable string for the provided scalar in the given units.
     */
  µ.formatScalar = function (value, units) {
    return units.conversion(value).toFixed(units.precision)
  }

    /**
     * Returns a human readable string for the provided rectangular wind vector in the given units.
     * See http://mst.nerc.ac.uk/wind_vect_convs.html.
     */
  µ.formatVector = function (wind, units) {
    var d = Math.atan2(-wind[0], -wind[1]) / τ * 360 // calculate into-the-wind cardinal degrees
    var wd = Math.round((d + 360) % 360 / 5) * 5 // shift [-180, 180] to [0, 360], and round to nearest 5.
    return wd.toFixed(0) + '° @ ' + µ.formatScalar(wind[2], units)
  }

  function xhrResolver (resource, d, error, result) {
    return error ? !error.status ? d.reject({ status: -1, message: 'Cannot load resource: ' + resource + ': ' + error, resource: resource, error: error }) : d.reject({ status: error.status, message: error.statusText, resource: resource, error: error }) : d.resolve(result)
  }

    /**
     * Returns the distortion introduced by the specified projection at the given point.
     *
     * This method uses finite difference estimates to calculate warping by adding a very small amount (h) to
     * both the longitude and latitude to create two lines. These lines are then projected to pixel space, where
     * they become diagonals of triangles that represent how much the projection warps longitude and latitude at
     * that location.
     *
     * <pre>
     *        (λ, φ+h)                  (xλ, yλ)
     *           .                         .
     *           |               ==>        \
     *           |                           \   __. (xφ, yφ)
     *    (λ, φ) .____. (λ+h, φ)       (x, y) .--
     * </pre>
     *
     * See:
     *     Map Projections: A Working Manual, Snyder, John P: pubs.er.usgs.gov/publication/pp1395
     *     gis.stackexchange.com/questions/5068/how-to-create-an-accurate-tissot-indicatrix
     *     www.jasondavies.com/maps/tissot
     *
     * @returns {Array} array of scaled derivatives [dx/dλ, dy/dλ, dx/dφ, dy/dφ]
     */
  µ.distortion = function (projection, λ, φ, x, y) {
    var hλ = λ < 0 ? H : -H
    var hφ = φ < 0 ? H : -H
    var pλ = projection([λ + hλ, φ])
    var pφ = projection([λ, φ + hφ])

        // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1° λ
        // changes depending on φ. Without this, there is a pinching effect at the poles.
    var k = Math.cos(φ * RAD)
    var hλk = hλ * k

    return [(pλ[0] - x) / hλk, // dx/dλ
      (pλ[1] - y) / hλk, // dy/dλ
      (pφ[0] - x) / hφ, // dx/dφ
      (pφ[1] - y) / hφ // dy/dφ
    ]
  }

    /*
     * Parses a URL hash fragment:
     *
     * example: "2013/11/14/0900Z/wind/isobaric/1000hPa/orthographic=26.50,-153.00,1430/overlay=off"
     * output: {date: "2013/11/14", hour: "0900", param: "wind", surface: "isobaric", level: "1000hPa",
     *          projection: "orthographic", orientation: "26.50,-153.00,1430", overlayType: "off"}
     *
     * grammar:
     *     hash   := ( "current" | yyyy / mm / dd / hhhh "Z" ) / param / surface / level [ / option [ / option ... ] ]
     *     option := type [ "=" number [ "," number [ ... ] ] ]
     *
     * @param hash the hash fragment.
     * @param projectionNames the set of allowed projections.
     * @param overlayTypes the set of allowed overlays.
     * @param oldAttr the old set of attributes that this parse will replace.
     * @returns {Object} the result of the parse.
     */
  µ.parse = function (hash, projectionNames, overlayTypes, oldAttr) {
    var option,
      result = {}
        //             1        2        3          4          5            6      7      8    9
    var tokens = /^(current|(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{3,4})Z)\/(\w+)\/(\w+)\/(\w+)([\/].+)?/.exec(hash)
    if (tokens) {
      var date = tokens[1] === 'current' ? 'current' : { year: +tokens[2], month: +tokens[3], day: +tokens[4] }
      if (date !== 'current') {
        var hour = (tokens[5].length === 3 ? '0' : '') + tokens[5]
        date.hour = +hour.substr(0, 2)
        date.minute = +hour.substr(2)
      }
      result = {
        date: date, // "current" or {year:, month:, day:, hour:, minute:}
        param: tokens[6], // non-empty alphanumeric _
        surface: tokens[7], // non-empty alphanumeric _
        level: tokens[8], // non-empty alphanumeric _
        projection: 'orthographic',
        orientation: '',
        topology: topologyFile(),
        overlayType: 'default',
        showGridPoints: false,
        animate: true,
        loc: null, // location mark coordinates [λ, φ]
        argoFloat: null,

                // These fields are part of the app state but not saved in the URL because they are transient state.
                // CONSIDER: separate state into three types of persistence: world, user, and session.
                //           corresponds to: URL, LocalStorage, document/javascript heap.

        hd: oldAttr.hd || false }
      µ.coalesce(tokens[9], '').split('/').forEach(function (segment) {
        if (option = /^(\w+)(=([\d\-.,]*))?$/.exec(segment)) {
          if (_.has(projectionNames, option[1])) {
            result.projection = option[1] // non-empty alphanumeric _
            result.orientation = µ.coalesce(option[3], '') // comma delimited string of numbers, or ""
          } else if (option[1] === 'loc') {
            var parts = _.isString(option[3]) ? option[3].split(',') : []
            var λ = +parts[0],
              φ = +parts[1]
            if (λ === λ && φ === φ) {
              result.loc = [λ, φ]
            }
          }
        } else if (option = /^overlay=(\w+)$/.exec(segment)) {
          if (overlayTypes.has(option[1]) || option[1] === 'default') {
            result.overlayType = option[1]
          }
        } else if (option = /^grid=(\w+)$/.exec(segment)) {
          if (option[1] === 'on') {
            result.showGridPoints = true
          }
        } else if (option = /^anim=(\w+)$/.exec(segment)) {
          if (option[1] === 'off') {
            result.animate = false
          }
        } else if (option = /^argo=(\w+)$/.exec(segment)) {
          switch (option[1]) {
            case 'planned':
            case 'recent':
            case 'active':
            case 'dead':
              result.argoFloat = option[1]
          }
        }
      })
    }
    return result
  }

    /**
     * @param query URL search query string, e.g., "?a=1&b=2&c=&d"
     * @returns {Object} an object of terms, e.g., {a: "1", b: "2", c: "", d: null}
     */
  µ.parseQueryString = function (query) {
    return _.object(query.split(/[?&]/).filter(µ.isTruthy).map(function (term) {
      return term.split('=').map(decodeURIComponent).concat([null]) // use null for 2nd element when undefined
    }))
  }

  µ.isAppMode = function () {
    return _.has(µ.parseQueryString(window.location.search), 'app')
  }

  µ.isKioskMode = function () {
    return _.has(µ.parseQueryString(window.location.search), 'kiosk')
  }

    /** @returns {boolean} true if globe rotation and zoom should be disabled. UNDONE: no one uses this. rip out? */
  µ.isFixedMode = function () {
    return _.has(µ.parseQueryString(window.location.search), 'fixed')
  }

    /**
     * @param {Array|Uint8Array|Float32Array} a any array-like object
     * @param {Array|Uint8Array|Float32Array} b any array-like object
     * @returns {boolean} true if both arrays are strictly equal (using ===)
     */
  µ.arraysEq = function (a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return a.length === b.length
  }

    /**
     * @param {Float32Array} a [a0, a1, a2, ...]
     * @param {Float32Array} b [b0, b1, b2, ...]
     * @returns {Float32Array} [a0, b0, a1, b1, a2, b2, ...]
     */
  µ.merge = function (a, b) {
    var result = new Float32Array(a.length * 2)
    for (var i = 0; i < a.length; i++) {
      var j = i * 2
      result[j] = a[i]
      result[j + 1] = b[i]
    }
    return result
  }

    /**
     * @param {*|Uint8Array} src any array-like object
     * @returns {Array} a new Array containing the same elements.
     */
  µ.toArray = function (src) {
    return Array.prototype.slice.call(src) // Replace with Array.from() in the future.
  }

    /**
     * @param {Int8Array|Int16Array|Int32Array} array any TypedArray
     * @param {Number} samples the number of samples to compute the hash code
     * @returns {Number} the hash code
     */
  function _arrayHashCode (array, samples) {
    var result = new Int32Array([array.byteLength])
    var step = Math.max(array.length / samples, 1)
    for (var i = 0; i < array.length; i += step) {
      result[0] = 31 * result[0] + array[Math.floor(i)]
    }
    return result[0]
  }

    /**
     * Constructs a hash code from _some_ elements of an array. Trades collision avoidance for performance.
     * @param {Float32Array|Uint8Array} array any TypedArray
     * @param {Number} [samples] the number of samples to compute the hash code with. (default: all)
     * @returns {Number} the hash code
     */
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

  µ.isArrayLike = function isArrayLike (o) {
    return Array.isArray(o) || (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && !!o && 'length' in o
  }
}())
