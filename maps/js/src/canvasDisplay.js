var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var MAX_TASK_TIME = 100;                  // amount of time before a task yields control (millis)
var MIN_SLEEP_TIME = 25;                  // amount of time a task waits before resuming (millis)
var MIN_MOVE = 4;                         // slack before a drag operation beings (pixels)
var MOVE_END_WAIT = 1000;                 // time to wait for a move operation to be considered done (millis)

var OVERLAY_ALPHA = Math.floor(0.4*255);  // overlay transparency (on scale [0, 255])
var INTENSITY_SCALE_STEP = 10;            // step size of particle intensity color scale
var MAX_PARTICLE_AGE = 100;               // max number of frames a particle is drawn before regeneration
var PARTICLE_LINE_WIDTH = 1.0;            // line width of a drawn particle
var PARTICLE_MULTIPLIER = 7;              // particle count scalar (completely arbitrary--this values looks nice)
var PARTICLE_REDUCTION = 0.75;            // reduce particle count to this much of normal for mobile devices
var FRAME_RATE = 40;                      // desired milliseconds per frame

var NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for undefined location outside the vector field [u, v, mag]
var HOLE_VECTOR = [NaN, NaN, null];       // singleton that signifies a hole in the vector field
var TRANSPARENT_BLACK = [0, 0, 0, 0];     // singleton 0 rgba
var REMAINING = "▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫▫";   // glyphs for remaining progress bar
var COMPLETED = "▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪";   // glyphs for completed progress bar

var canvasDisplay = (function(){
	var overlayData = {},
		initialized = false,
        mode = 'fixed',
        zooming = false,
		windBuilder = {
	        field: "vector",
	        type: "wind",
	        description: {
	            name: {en: "Wind", ja: "風速"},
	            qualifier: {en: " @ " , ja: " @ " }
	        },
	        paths: [],
	        date: new Date(),
	        builder: function(file) {
	        	//console.log(file)
	            var uData = file[0].data, vData = file[1].data;
	            return {
	                header: file[0].header,
	                interpolate: bilinearInterpolateVector,
	                data: function(i) {
	                    return [uData[i], vData[i]];
	                }
	            }
	        },
	        units: [
	            {label: "km/h", conversion: function(x) { return x * 3.6; },      precision: 0},
	            {label: "m/s",  conversion: function(x) { return x; },            precision: 1},
	            {label: "kn",   conversion: function(x) { return x * 1.943844; }, precision: 0},
	            {label: "mph",  conversion: function(x) { return x * 2.236936; }, precision: 0}
	        ],
	        scale: {
	            bounds: [0, 100],
	            gradient: function(v, a) {
	                return µ.extendedSinebowColor(Math.min(v, 100) / 100, a);
	            }
	        },
	        particles: {velocityScale: 1/60000, maxIntensity: 17}
	    },
        gridBuilder = {
            field: "scalar",
            type: "temp",
            description: {
                name: {en: "Grids", ja: "気温"},
                qualifier: {}
            },
            paths: [],
            date: new Date(),

            builder: function(file) {
                var record = file[0], data = record.data;
                return {
                    header: record.header,
                    interpolate: bilinearInterpolateScalar,
                    data: function(i) {
                        return data[i];
                    }
                }
            },

            units: [
                {label: "°C", conversion: function(x) { return x - 273.15; },       precision: 1},
                {label: "°F", conversion: function(x) { return x * 9/5 - 459.67; }, precision: 1},
                {label: "K",  conversion: function(x) { return x; },                precision: 1}
            ],

            scale: {
                bounds: [-100, 100],
                gradient: µ.segmentedColorScale([
                    [-100,     [37, 4, 42]],
                    [-80,     [41, 10, 130]],
                    [-60,     [81, 40, 40]],
                    [-40,  [192, 37, 149]],  // -40 C/F
                    [-20, [70, 215, 215]],  // 0 F
                    [0,  [21, 84, 187]],   // 0 C
                    [20,  [24, 132, 14]],   // just above 0 C
                    [40,     [247, 251, 59]],
                    [60,     [235, 167, 21]],
                    [80,     [230, 71, 39]],
                    [100,     [88, 27, 67]]
                ])
            }
        };

	function createMask(globe) {
        if (!globe) return null;

        //console.time("render mask");

        // Create a detached canvas, ask the model to define the mask polygon, then fill with an opaque color.
        var width = view.width, height = view.height;
        var canvas = d3.select(document.createElement("canvas")).attr("width", width).attr("height", height).node();
        var context = globe.defineMask(canvas.getContext("2d"));
        context.fillStyle = "rgba(255, 0, 0, 1)";
        context.fill();
        // d3.select("#display").node().appendChild(canvas);  // make mask visible for debugging

        var imageData = context.getImageData(0, 0, width, height);
        //console.log('context image data',imageData)

        var data = imageData.data;  // layout: [r, g, b, a, r, g, b, a, ...]
        //console.timeEnd("render mask");
        return {
            imageData: imageData,
            isVisible: function(x, y) {
                var i = (y * width + x) * 4;
                return data[i + 3] > 0;  // non-zero alpha means pixel is visible
            },
            set: function(x, y, rgba) {
                var i = (y * width + x) * 4;
                data[i    ] = rgba[0];
                data[i + 1] = rgba[1];
                data[i + 2] = rgba[2];
                data[i + 3] = rgba[3];
                return this;
            }
        };
    }

    function createField(columns, bounds, mask) {

        /**
         * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
         *          is undefined at that point.
         */
        function field(x, y) {
            var column = columns[Math.round(x)];
            return column && column[Math.round(y)] || NULL_WIND_VECTOR;
        }

        /**
         * @returns {boolean} true if the field is valid at the point (x, y)
         */
        field.isDefined = function(x, y) {
            return field(x, y)[2] !== null;
        };

        /**
         * @returns {boolean} true if the point (x, y) lies inside the outer boundary of the vector field, even if
         *          the vector field has a hole (is undefined) at that point, such as at an island in a field of
         *          ocean currents.
         */
        field.isInsideBoundary = function(x, y) {
            return field(x, y) !== NULL_WIND_VECTOR;
        };

        // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
        // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
        field.release = function() {
            columns = [];
        };

        field.randomize = function(o) {  // UNDONE: this method is terrible
            var x, y;
            var safetyNet = 0;
            do {
                x = Math.round(_.random(bounds.x, bounds.xMax));
                y = Math.round(_.random(bounds.y, bounds.yMax));
            } while (!field.isDefined(x, y) && safetyNet++ < 30);
            o.x = x;
            o.y = y;
            return o;
        };

        field.overlay = mask.imageData;

        return field;
    }

    /**
     * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
     * vector is modified in place and returned by this function.
     */
    function distort(projection, λ, φ, x, y, scale, wind) {
        var u = wind[0] * scale;
        var v = wind[1] * scale;
        var d = µ.distortion(projection, λ, φ, x, y);

        // Scale distortion vectors by u and v, then add.
        wind[0] = d[0] * u + d[2] * v;
        wind[1] = d[1] * u + d[3] * v;
        return wind;
    }

    function interpolateField(globe, grids, cb) {
        if (!globe || !grids) return null;

        var mask = createMask(globe);
        var primaryGrid = {};//grids;//.primaryGrid;
        var overlayGrid = grids;//.overlayGrid;

        //console.time("interpolating field");
        //console.log('interpolating field',overlayGrid)
        //var d = when.defer(), cancel = this.cancel;

        var projection = globe.projection;
        var bounds = globe.bounds(view);

        // How fast particles move on the screen (arbitrary value chosen for aesthetics).
        var velocityScale = bounds.height * 1/6000;

        var columns = [];
        var point = [];
        var x = bounds.x;
        //var interpolate = primaryGrid.interpolate;
        var overlayInterpolate = overlayGrid.interpolate;
        //console.log('overlayInterpolate',overlayInterpolate)
        var hasDistinctOverlay = primaryGrid !== overlayGrid;
        var scale = overlayGrid.scale;

        function interpolateColumn(x) {
            var column = [];
            for (var y = bounds.y; y <= bounds.yMax; y += 2) {
                if (mask.isVisible(x, y)) {
                    point[0] = x; point[1] = y;
                    var coord = projection.invert(point);
                    var color = TRANSPARENT_BLACK;
                    var wind = null;
                    if (coord) {
                        var λ = coord[0], φ = coord[1];
                        //console.log(λ,φ)
                        if (isFinite(λ)) {
                            //wind = interpolate(λ, φ);
                            var scalar = null;
                            if (false) { //wind
                                wind = distort(projection, λ, φ, x, y, velocityScale, wind);
                                scalar = wind[2];
                            }
                            if (true) {
                                //console.log(λ, φ)
                                scalar = overlayInterpolate(λ, φ);
                            }
                            //console.log(scalar)
                            if (µ.isValue(scalar)) {
                                color = scale.gradient(scalar, OVERLAY_ALPHA);
                            }
                        }
                    }
                    column[y+1] = column[y] = wind || HOLE_VECTOR;
                    mask.set(x, y, color).set(x+1, y, color).set(x, y+1, color).set(x+1, y+1, color);
                }
            }
            columns[x+1] = columns[x] = column;
        }

        (function batchInterpolate() {

            var start = Date.now();
            while (x < bounds.xMax) {
                interpolateColumn(x);
                x += 2;
                if ((Date.now() - start) > MAX_TASK_TIME) {
                    // Interpolation is taking too long. Schedule the next batch for later and yield.
                    console.log(' Interpolation is taking too long. Schedule the next batch for later and yield.')
                    setTimeout(batchInterpolate, MIN_SLEEP_TIME);
                    return;
                }
            }
            var field = createField(columns, bounds, mask)
            //console.log('the field',columns,bounds,mask)
           	cb(mask.imageData);

            //report.progress(1);  // 100% complete
            //console.timeEnd("interpolating field");
        })();

    }

    function buildGrid(builder) {
        // var builder = createBuilder(data);

        var header = builder.header;
        var λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
        var Δλ = header.dx, Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
        var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
        var date = new Date(header.refTime);
        date.setHours(date.getHours() + header.forecastTime);

        // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
        // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
        var grid = [], p = 0;
        var isContinuous = Math.floor(ni * Δλ) >= 360;
        for (var j = 0; j < nj; j++) {
            var row = [];
            for (var i = 0; i < ni; i++, p++) {
                row[i] = builder.data(p);
            }
            if (isContinuous) {
                // For wrapped grids, duplicate first column as last column to simplify interpolation logic
                row.push(row[0]);
            }
            grid[j] = row;
        }

        function interpolate(λ, φ) {
            var i = µ.floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
            var j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

            //         1      2           After converting λ and φ to fractional grid indexes i and j, we find the
            //        fi  i   ci          four points "G" that enclose point (i, j). These points are at the four
            //         | =1.4 |           corners specified by the floor and ceiling of i and j. For example, given
            //      ---G--|---G--- fj 8   i = 1.4 and j = 8.3, the four surrounding grid points are (1, 8), (2, 8),
            //    j ___|_ .   |           (1, 9) and (2, 9).
            //  =8.3   |      |
            //      ---G------G--- cj 9   Note that for wrapped grids, the first column is duplicated as the last
            //         |      |           column, so the index ci can be used without taking a modulo.

            var fi = Math.floor(i), ci = fi + 1;
            var fj = Math.floor(j), cj = fj + 1;

            var row;
            if ((row = grid[fj])) {
                var g00 = row[fi];
                var g10 = row[ci];
                if (µ.isValue(g00) && µ.isValue(g10) && (row = grid[cj])) {
                    var g01 = row[fi];
                    var g11 = row[ci];
                    if (µ.isValue(g01) && µ.isValue(g11)) {
                        // All four points found, so interpolate the value.
                        return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                    }
                }
            }
            // console.log("cannot interpolate: " + λ + "," + φ + ": " + fi + " " + ci + " " + fj + " " + cj);
            return null;
        }

        return {
            source: dataSource(header),
            date: date,
            interpolate: interpolate,
            forEachPoint: function(cb) {
                for (var j = 0; j < nj; j++) {
                    var row = grid[j] || [];
                    for (var i = 0; i < ni; i++) {
                        cb(µ.floorMod(180 + λ0 + i * Δλ, 360) - 180, φ0 - j * Δφ, row[i]);
                    }
                }
            }
        };
    }

	function clearCanvas(canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        return canvas;
    }

	function loadData(url,cb){
		d3.json(url,function(err,data){
			if(err){ console.log('error loading data',err) }
			cb(data);
		})
	}

	function bilinearInterpolateScalar(x, y, g00, g10, g01, g11) {
        //console.log(x, y, g00, g10, g01, g11)
        var rx = (1 - x);
        var ry = (1 - y);
        return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
    }

    function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        var a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return [u, v, Math.sqrt(u * u + v * v)];
    }

    function dataSource(header) {
        // noinspection FallthroughInSwitchStatementJS
        switch (header.center || header.centerName) {
            case -3:
                return "OSCAR / Earth & Space Research";
            case 7:
            case "US National Weather Service, National Centres for Environmental Prediction (NCEP)":
                return "GFS / NCEP / US National Weather Service";
            default:
                return header.centerName;
        }
    }



    function drawGridPoints(ctx, grid, globe) {
        if (!grid || !globe || !configuration.get("showGridPoints")) return;

        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        // Use the clipping behavior of a projection stream to quickly draw visible points.
        var stream = globe.projection.stream({
            point: function(x, y) {
                ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            }
        });
        grid.forEachPoint(function(λ, φ, d) {
            if (µ.isValue(d)) {
                stream.point(λ, φ);
            }
        });
    }

    function isValue(x) {
        return x !== null && x !== undefined;
    }

    function drawGridPoints(ctx, grid, globe) {
        if (!grid || !globe ) return;
        //console.log('draw grid points',grid,globe)
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        // Use the clipping behavior of a projection stream to quickly draw visible points.
        var stream = globe.projection.stream({
            point: function(x, y) {
                ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            }
        });
        grid.forEachPoint(function(λ, φ, d) {
        	if (isValue(d)) {
            	stream.point(λ, φ);
            }
        });
    }

    function drawOverlay(grid,globe){
    	//console.log('draw overlay',d3.select("#overlay").node());
		var ctx = d3.select("#overlay").node().getContext("2d");

        clearCanvas(d3.select("#overlay").node());
        //clearCanvas(d3.select("#scale").node());

        interpolateField(globe,grid,function(overlay){
        	ctx.putImageData(overlay, 0, 0);
        	//drawGridPoints(ctx, grid,globe);
        })
	}

	function animateOverlay(data,globe){
    	//console.log('draw overlay',d3.select("#overlay").node());
		var ctx = d3.select("#overlay").node().getContext("2d");

        clearCanvas(d3.select("#overlay").node());
        //clearCanvas(d3.select("#scale").node());

		//console.log('animate grids',grid)
		var i = 0
		setInterval(function() {
            if(!zooming){
    			if (i === 8) {
    				i = 0
    			}

                var phaseData = {
                    header: data.header,
                    data: data.data[i]
                }

                var grid = Object.assign(gridBuilder, buildGrid(gridBuilder.builder([phaseData])));
            
    			//console.log('grid', grid[i], i)
    			interpolateField(globe,grid,function(overlay){
    				//console.log('our overlay',overlay.data.filter(function(d){ return d > 0}).length)

    	        	ctx.putImageData(overlay, 0, 0);

    			})
                i ++;
            }
		}, 250)
		
	}

	return {

		drawWind:function(globe){

			loadData('data/weather/current/current-wind-surface-level-gfs-1.0.json',function(data){
				console.log('INIT the data',data)
				overlayData = Object.assign(windBuilder, buildGrid(windBuilder.builder(data)));
				console.log('overlayData',overlayData);
				drawOverlay(overlayData,globe);
				initialized = true;
			})
		},

		// gridData6.json aligns with heightData4.json (RMM phase 6)
        drawGrids:function(globe){

            loadData('processing/gridData6.json',function(data){
                console.log('INIT the data grid',data)
                overlayData = Object.assign(gridBuilder, buildGrid(gridBuilder.builder([data])));
                console.log('overlayData',overlayData);
                drawOverlay(overlayData,globe);
                initialized = true;
            })
        },

		// Temp addition to add another field of data
		drawHeights:function(globe){

            loadData('processing/heightData4.json',function(data){
                console.log('INIT the data grid',data)
                overlayData = Object.assign(gridBuilder, buildGrid(gridBuilder.builder([data])));
                console.log('overlayData',overlayData);
                drawOverlay(overlayData,globe);
                initialized = true;
            })
        },

		animateGrids:function(globe){
            loadData('processing/gridDataArray.json',function(data){

                console.log('INIT the data grid',data)
				var animateData = [];
				
                // console.log('overlayData',overlayData);
                animateOverlay(data,globe);
                initialized = true;
                mode = 'animate';

            })
        },

		update:function(globe){
            if(mode === 'fixed'){
			 drawOverlay(overlayData,globe);
            }else if(mode === 'animate'){
                zooming = false;
            }
		},

		hide:function(){
            if(mode === 'animate'){
                zooming = true;
            }
			clearCanvas(d3.select("#overlay").node());
		}

	}

})()
