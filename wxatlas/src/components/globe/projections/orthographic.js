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

var π = Math.PI,
  τ = 2 * π,
  DEG = 360 / τ,
  RAD = τ / 360

/**
 * @param {number} R radius of the sphere (i.e., scale)
 * @param {number} λ0 longitude of projection center (degrees)
 * @param {number} φ0 latitude of projection center (degrees)
 * @param {number} x0 translation along x axis
 * @param {number} y0 translation along y axis
 * @returns {Function} projection function f([λ, φ]) and f.invert([x, y]), just like D3.
 */
function orthographic (R, λ0, φ0, x0, y0) {
    // Check if φ0 is rotated far enough that the globe is upside down. If so, adjust the projection center and
    // flip the x,y space. For example, rotation of +100 is actually lat of 80 deg with lon on other side.

  var φnorm = µ.floorMod(φ0 + 90, 360) // now on range [0, 360). Anything on range (180, 360) is flipped.
  var flip = φnorm > 180 ? -1 : 1
  if (flip < 0) {
    φ0 = 270 - φnorm
    λ0 += 180
  } else {
    φ0 = φnorm - 90
  }
  φ0 *= RAD
  λ0 = (µ.floorMod(λ0 + 180, 360) - 180) * RAD // normalize to [-180, 180)

  var R2 = R * R
  var sinφ0 = Math.sin(φ0)
  var cosφ0 = Math.cos(φ0)
  var Rcosφ0 = R * cosφ0
  var cosφ0dR = cosφ0 / R
  var center = [x0, y0]

    /**
     * @param {number[]} coord [λ, φ] in degrees
     * @returns {number[]} resulting [x, y] or [NaN, NaN] if the coordinates are not defined for the projection.
     */
  function project (coord) {
    var lon = coord[0]
    var lat = coord[1]
    if (lon !== lon || lat !== lat) {
      return [NaN, NaN]
    }
    var λ = lon * RAD
    var φ = lat * RAD
    var Δλ = λ - λ0
    var sinΔλ = Math.sin(Δλ)
    var cosΔλ = Math.cos(Δλ)
    var sinφ = Math.sin(φ)
    var cosφ = Math.cos(φ)
    var Rcosφ = R * cosφ
        // const cosc = sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ;  // test if clip angle > 90°
        // if (cosc < 0) return [NaN, NaN];
    var x = Rcosφ * sinΔλ
    var y = Rcosφ * cosΔλ * sinφ0 - Rcosφ0 * sinφ // negates y because it grows downward
    var px = x * flip + x0
    var py = y * flip + y0
    return [px, py]
  }

    /**
     * @param {number[]} point [x, y]
     * @returns {number[]} resulting [λ, φ] in degrees or [NaN, NaN] if the point is not defined for the projection.
     */
  function invert (point) {
    var px = point[0]
    var py = point[1]
    var x = (px - x0) * flip
    var y = (y0 - py) * flip // negate y because it grows downward

        // const ρ = Math.sqrt(x * x + y * y);   // positive number
        // const c = Math.asin(ρ / R);           // [0, π/2] or NaN when ρ > R (meaning the point is outside the globe)
        // const sinc = Math.sin(c);             // [0, 1] because c in range [0, π/2]
        // const cosc = Math.cos(c);             // [0, 1] because c in range [0, π/2]
        // const ysinc = y * sinc;
        // const λ = λ0 + Math.atan2(x * sinc, ρ * cosc * cosφ0 - ysinc * sinφ0);
        // const φ = ρ === 0 ? φ0 : Math.asin(cosc * sinφ0 + ysinc * cosφ0 / ρ);

    var ρ2 = x * x + y * y
    var d = 1 - ρ2 / R2
    if (d >= 0) {
      var cosc = Math.sqrt(d) // cos(asin(x)) == sqrt(1 - x*x)
      var λ = λ0 + Math.atan2(x, cosc * Rcosφ0 - y * sinφ0)
      var φ = Math.asin(cosc * sinφ0 + y * cosφ0dR)
      return [λ * DEG, φ * DEG]
    }
    return [NaN, NaN] // outside of projection
  }

  project.invert = invert

    /**
     * @param {GLUStick} glu
     */
  function webgl (glu) {
    return {
      shaderSource: function shaderSource () {
        return '\nuniform vec2 u_translate;   // screen coords translation (x0, y0)\nuniform float u_R2;         // scale R, squared\nuniform float u_lon0;       // origin longitude\nuniform float u_sinlat0;    // sin(lat0)\nuniform float u_Rcoslat0;   // R * cos(lat0)\nuniform float u_coslat0dR;  // cos(lat0) / R\nuniform float u_flip;       // 1.0 if lat0 in range [-90deg, +90deg], otherwise -1.0\n\n// Handbook of Mathematical Functions, M. Abramowitz and I.A. Stegun, Ed. For input on range [-1, +1]\n// http://http.developer.nvidia.com/Cg/asin.html\nfloat arcsin(in float v) {\n    float x = abs(v);\n    float ret = -0.0187293;\n    ret *= x;\n    ret += 0.0742610;\n    ret *= x;\n    ret -= 0.2121144;\n    ret *= x;\n    ret += 1.5707288;\n    ret = PI / 2.0 - sqrt(1.0 - x) * ret;\n    return sign(v) * ret;\n}\n\n/** @returns [lon, lat] in radians for the specified point [x, y], or [7e37, 7e37] if the point is unprojectable. */\nvec2 invert(in vec2 point) {\n    vec2 pt = (point - u_translate) * u_flip;\n    float d = 1.0 - dot(pt, pt) / u_R2;\n    if (d >= 0.0) {  // CONSIDER: step() to remove branch... worth it?\n        float cosc = sqrt(d);\n        float lon = u_lon0 + atan(pt.x, cosc * u_Rcoslat0 - pt.y * u_sinlat0);  // u_lon0 + [-pi/2, pi/2]\n        float lat = arcsin(cosc * u_sinlat0 + pt.y * u_coslat0dR);              // [-π/2, π/2] [-90°, +90°]\n        return vec2(lon, lat);\n    }\n    return vec2(7e37);  // outside of projection\n}\n'
      },
      textures: function textures () {
        return {}
      },
      uniforms: function uniforms () {
        return {
          u_translate: center, // screen coords translation (x0, y0)
          u_R2: R2, // scale R, squared
          u_lon0: λ0, // origin longitude
          u_sinlat0: sinφ0, // sin(lat0)
          u_Rcoslat0: Rcosφ0, // R * cos(lat0)
          u_coslat0dR: cosφ0dR, // cos(lat0) / R
          u_flip: flip }
      }
    }
  }

  project.webgl = webgl

  return project
}

/**
 * @param p d3 version of orthographic projection.
 * @returns {Function} projection function f([λ, φ]) and f.invert([x, y]), just like D3.
 */
orthographic.fromD3 = function (p) {
  var t = p.translate(),
    r = p.rotate()
  if (r[2] !== 0) {
    throw new Error('γ rotation not supported')
  }
  return orthographic(p.scale(), -r[0], -r[1], t[0], t[1])
}

module.exports = orthographic
