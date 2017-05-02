function interpolateField (globe, grids) {
  if (!globe || !grids || !rendererAgent.value()) return null

  var mask = createMask(globe)
  var primaryGrid = grids.primaryGrid
  var overlayGrid = grids.overlayGrid

        // nothing to do if products failed to load and have no data
  if (!primaryGrid.field || !overlayGrid.field) return null

  var interpolationType = 'bilinear'
  var interpolate = primaryGrid.field()[interpolationType]
  var overlayInterpolate = overlayGrid.field()[interpolationType]

  log.time('interpolating field')
  var d = when.defer(), cancel = this.cancel

  var projection = globe.optimizedProjection()
  var invert = projection.invert.bind(projection)

  var bounds = globe.bounds(view)
        // How fast particles move on the screen (arbitrary value chosen for aesthetics).
  var velocityScale = primaryGrid.particles.velocityScale

  var rows = []
  var point = []
  var y = bounds.y
  var hasDistinctOverlay = primaryGrid !== overlayGrid
  var colorScale = overlayGrid.scale

  var hd = configuration.get('hd'), step = hd ? 1 : 2

  function interpolateRow (y) {
    var row = new Float32Array(bounds.width * 3)  // [u0, v0, m0, u1, v1, m1, ...]
    for (var x = bounds.x, i = 0; x <= bounds.xMax; x += step, i += step * 3) {
      var wind = NULL_WIND_VECTOR
      if (mask.isVisible(x, y)) {
        point[0] = x, point[1] = y
        var coord = invert(point)
        var color = TRANSPARENT_BLACK
        if (coord) {
          var λ = coord[0], φ = coord[1]
          if (λ === λ) {
            wind = interpolate(coord)
            var scalar = wind[2]
            if (scalar === scalar) {
              wind = distort(projection, λ, φ, x, y, velocityScale, wind)
              scalar = wind[2]
            } else {
              wind = HOLE_VECTOR
            }
            if (hasDistinctOverlay) {
              scalar = µ.scalarize(overlayInterpolate(coord))
            }
            if (scalar === scalar) {
              color = colorScale.gradient(scalar, overlayGrid.alpha.animated)
            }
          }
        }
        mask.set(x, y, color)
        if (!hd) {
          mask.set(x + 1, y, color).set(x, y + 1, color).set(x + 1, y + 1, color)
        }
                    // mask.set(x, y  , color).set(x+1, y  , color)/*.set(x+2, y  , color).set(x+3, y  , color)*/;
                    // mask.set(x, y+1, color).set(x+1, y+1, color)/*.set(x+2, y+1, color).set(x+3, y+1, color)*/;
                    // mask.set(x, y+2, color).set(x+1, y+2, color).set(x+2, y+2, color).set(x+3, y+2, color);
                    // mask.set(x, y+3, color).set(x+1, y+3, color).set(x+2, y+3, color).set(x+3, y+3, color);
      }
      /* row[i+ 9] = row[i+6] = */ /* row[i+3] = */ row[i ] = wind[0]
      /* row[i+10] = row[i+7] = */ /* row[i+4] = */ row[i + 1] = wind[1]
      /* row[i+11] = row[i+8] = */ /* row[i+5] = */ row[i + 2] = wind[2]
      if (!hd) {
        row[i + 3] = wind[0]
        row[i + 4] = wind[1]
        row[i + 5] = wind[2]
      }
    }
    rows[y] = row
    if (!hd) {
      rows[y + 1] = row
    }
            // /*rows[y+3] = rows[y+2] =*/ /*rows[y+1] =*/ rows[y] = row;
  }

  report.status('')
  report.progress(0);  // signal that we are starting interpolation

  (function batchInterpolate () {
    try {
      if (!cancel.requested) {
        var start = Date.now()
        while (y <= bounds.yMax) {
          interpolateRow(y)
          y += step
          if ((Date.now() - start) > MAX_TASK_TIME) {
                            // Interpolation is taking too long. Schedule the next batch for later and yield.
            report.progress(Math.round((y - bounds.y) / (bounds.yMax - bounds.y) * 100))
            setTimeout(batchInterpolate, MIN_SLEEP_TIME)
            return
          }
        }
      }
      d.resolve(createField(rows, mask, bounds))
    } catch (e) {
      d.reject(e)
    }
    report.progress(100)  // 100% complete
    log.timeEnd('interpolating field')
  })()

  return d.promise
}
