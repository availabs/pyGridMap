var d3 = require('d3')
var topojson = require('topojson');
var _ = require('underscore')
var bilinear = require('./gl/interpolate_bilinear')
var nearest = require('./gl/nearest')
var globes = require('./projections/globes')

var globe = {
	version: '0.0.1',
	container: null,
	display: null,
	getView: {},
    overlayData: null,
	projection: 'orthographic',
	map: null,
	zoomLevel: 320,
	REDRAW_WAIT: 5,
	newOp: null,
	path: null,
	leftOffset: 0,
    fastoverlay: null,
    scale: d3.scale.quantile()
        .domain([-100,-80,-60,-40,-20, 20, 40, 60, 80, 100])
        .range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"])
}

globe.init = function(container, options) {
	this.container = container
    var scope = this;
	globe.display = d3.select(container)
	  	.append('div')
	  	.attr('class', 'display')

	globe.display
		.append('svg')
		.attr('id', 'map')
		.attr('class', 'fill-screen')

	globe.display
		.append('canvas')
		.attr('id', 'animation')
		.attr('class', 'fill-screen')

	globe.display
		.append('canvas')
		.attr('id', 'overlay')
		.attr('class', 'fill-screen')

    globe.display
        .append('canvas')
        .attr('id', 'fastoverlay')
        .attr('class', 'fill-screen')
        .style({'opacity': '0.6'})

	globe.display
		.append('svg')
		.attr('id', 'foreground')
		.attr('class', 'fill-screen')

	this.view = this.getView()

	if (options && options.projection) {
		var valid_projections = ['atlantis','azimuthal_equidistant','conic_equidistant','equirectangular','orthographic','stereographic','waterman','winkel3']
		if(valid_projections.indexOf(options.projection) >= 0){
			this.projection = options.projection
		}
	}

	this.map = globes[this.projection](this.view);
	this.map.defineMap(d3.select("#map"), d3.select("#foreground"));
	this.map.orientation('-60, 0, ' + globe.zoomLevel.toString() ,this.view);

	//TODO: Figure out why leftOffset isn't being passed properly
    d3.selectAll(".fill-screen")
        .attr("width", scope.view.width)
        .attr("height", scope.view.height)
        .style({
            'position': 'absolute',
            'left': globe.leftOffset + 'px'
        });
	
	this.loadGeo({},function () {
		globe.path = d3.geo.path().projection(globe.map.projection).pointRadius(7);
		var coastline = d3.select(".coastline");
		var lakes = d3.select(".lakes");
		var grids = d3.select(".colorGrids");

		var coastData = scope.coastHi
		var lakeData = scope.lakesHi
        console.log('set')
		

        coastline.datum(coastData);
		lakes.datum(lakeData);

		d3.selectAll("path").attr("d", globe.path)
		globe.display.call(globe.zoom);
	})

	window.onresize = function() {
		globe.view = globe.getView();
        console.log('resize')
		d3.selectAll(".fill-screen")
            .attr("width", scope.view.width)
            .attr("height", scope.view.height)
            .style({
                'position': 'absolute',
                'left': globe.leftOffset + 'px'
            });
        
        var canvas = d3.select("#fastoverlay").node();
        globe.fastoverlay = require("./gl/fastoverlay")(canvas);
        globe.fastoverlay.draw(globe.map.optimizedProjection(), globe.overlayData)
	}
}

globe.setupWebGL = function () {
    var start = Date.now();
    var glReport = require("./gl/glCheck");
    var msg = glReport.pass ? "ok" : JSON.stringify(glReport);
    console.log('test 123', msg)
    console.log("check gl (" + (Date.now() - start) + "ms): " + msg);
    if (!glReport.pass) {
        return;
    }
    var canvas = d3.select("#fastoverlay").node();
    globe.fastoverlay = require("./gl/fastoverlay")(canvas);
    console.log('fastoverlay?', globe.fastoverlay)
    globe.fastoverlay.draw(globe.map.optimizedProjection(), globe.overlayData)
}

globe.loadGeo = function(options, cb){

	d3.json('/data/earth-topo.json',function(err,topo){

		globe.topo = topo
		globe.o = topo.objects;
		globe.coastLo = topojson.feature(topo, globe.o.coastline_110m);
		globe.coastHi = topojson.feature(topo, globe.o.coastline_50m);
		globe.lakesLo = topojson.feature(topo, globe.o.lakes_110m);
		globe.lakesHi = topojson.feature(topo, globe.o.lakes_50m);
		cb()
	});
}

globe.getView = function(){
	// console.log('get view', this.container)
	var w = window;
	var d = document && document.documentElement;
	var b = document.querySelector(this.container);
    var x = b.offsetWidth;
	var y = b.offsetHeight;
    var rect =  b.getBoundingClientRect();
    
	return {width: x, height: y, left: rect.left, top: rect.top};
}


globe.newOp = function (startMouse, startScale) {
	return {
		type: "click",  // initially assumed to be a click operation
		startMouse: startMouse,
		startScale: startScale,
		manipulator: globe.map.manipulator(startMouse, startScale)
	};
}

globe.zoom = d3.behavior.zoom()
	.scale(globe.zoomLevel)
	.on("zoomstart", function() {
		globe.op = globe.op || globe.newOp(d3.mouse(this), globe.zoom.scale());  // a new operation begins
		// Render lo-res coastlines and lakes
		var coastline = globe.display.select('.coastline')
		var lakes = globe.display.select('.lakes')
		coastline.datum(globe.coastLo);
		lakes.datum(globe.lakesLo);
        if(globe.overlayData){
            clearCanvas(d3.select("#overlay").node());
        }
        // console.log('zoomstart')

	})
	.on("zoom", function() {
		var currentMouse = d3.mouse(this), currentScale = d3.event.scale;
		//console.log()
		globe.op = globe.op || globe.newOp(currentMouse, 1);  // Fix bug on some browsers where zoomstart fires out of order.
		if (globe.op.type === "click" || globe.op.type === "spurious") {
			var distanceMoved = distance(currentMouse, globe.op.startMouse);
			if (currentScale === globe.op.startScale && distanceMoved < 4) {
				// to reduce annoyance, ignore op if mouse has barely moved and no zoom is occurring
				globe.op.type = distanceMoved > 0 ? "click" : "spurious";
				return;
			}
			//dispatch.trigger("moveStart");
			globe.doDraw_throttled()
			//op.type = "drag";
		}
		if (currentScale != globe.op.startScale) {
			globe.op.type = "zoom";  // whenever a scale change is detected, (stickily) switch to a zoom operation
		}
        //console.log('zooming', currentMouse, currentScale)
		// when zooming, ignore whatever the mouse is doing--really cleans up behavior on touch devices
		globe.op.manipulator.move(globe.op.type === "zoom" ? null : currentMouse, currentScale);
		//console.log('zoom2',op.type === "zoom" ? null : currentMouse, currentScale);
		globe.doDraw_throttled();
	})
	.on("zoomend", function() {
		globe.op.manipulator.end();
		// Render hi-res coastlines and lakes
		
		if (globe.op.type === "click") {
			//dispatch.trigger("click", op.startMouse, globe.projection.invert(op.startMouse) || []);
		}
		else if (globe.op.type !== "spurious") {
			//signalEnd();
		}
		//canvasDisplay.update(globe);
        if(globe.overlayData){
            globe.drawOverlay()
        }

		globe.op = null;  // the drag/zoom/click operation is over
	});

	globe.doDraw = function() {
        if(globe.fastoverlay) {
            globe.fastoverlay.draw(this.map.optimizedProjection(), globe.overlayData)
        }
		globe.display.selectAll("path").attr("d", globe.path);
		globe.doDraw_throttled = _.throttle(globe.doDraw, globe.REDRAW_WAIT, {leading: false});
	}

globe.doDraw_throttled = _.throttle(globe.doDraw, globe.REDRAW_WAIT, {leading: false});

globe.drawOverlay = function(){

    //globe.fastoverlay.draw(this.map.optimizedProjection(), globe.overlayData)
    if ( false ) {
        console.log('old overlay')
        var ctx = d3.select("#overlay").node().getContext("2d");

        clearCanvas(d3.select("#overlay").node());
        console.time('interpolate')
        globe.interpolateField(globe.overlayData, function(overlay){
            console.timeEnd('interpolate')
            ctx.putImageData(overlay, 0, 0);
            var coastline = globe.display.select('.coastline')
            var lakes = globe.display.select('.lakes')
            coastline.datum(globe.coastHi);
            lakes.datum(globe.lakesHi);
            globe.display.selectAll("path").attr("d", globe.path);
            //drawGridPoints(ctx, grid,globe);
        })
    }
}

globe.createMask = function () {
    if (!globe.map) return null;

    //console.time("render mask");

    // Create a detached canvas, ask the model to define the mask polygon, then fill with an opaque color.
    var width = globe.view.width, height = globe.view.height;
	var canvas = d3.select(document.createElement("canvas"))
        .attr("width", width)
        .attr("height", height).node();
    var context = globe.map.defineMask(canvas.getContext("2d"));
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

globe.interpolateField = function(grids, cb) {
    if (!globe.map || !grids) return null;

    console.time('init')
    var mask = globe.createMask();
    var primaryGrid = {};//grids;//.primaryGrid;
    var overlayGrid = grids;//.overlayGrid;

    //var d = when.defer(), cancel = this.cancel;

    var projection = globe.map.projection;
    var bounds = globe.map.bounds(globe.view);

    // How fast particles move on the screen (arbitrary value chosen for aesthetics).
    var velocityScale = bounds.height * 1/6000;

    var columns = [];
    var point = [];
    var x = bounds.x;
    //var interpolate = primaryGrid.interpolate;

    var overlayInterpolate = overlayGrid.interpolate;
    var hasDistinctOverlay = primaryGrid !== overlayGrid;
    var scale = overlayGrid.scale;
    console.timeEnd('init')
    console.log('testing', scale.gradient.range(), )
    scale.gradient = globe.scale

    function interpolateColumn(x) {
        var column = [];
        for (var y = bounds.y; y <= bounds.yMax; y += 2) {
            if (mask.isVisible(x, y)) {
                point[0] = x; point[1] = y;
                var coord = projection.invert(point);

                var color = [0, 0, 0, 0];
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
                            scalar = overlayInterpolate(λ, φ);
                        }
                        if (isValue(scalar)) {
                            color = convertHex( scale.gradient(scalar), OVERLAY_ALPHA);
                            //console.log('color',color)
                        }
                    }
                }
                // if(scalar) {
                //     console.log('val', scalar, y)    
                // }
                
                //column[y+1] = column[y] = wind || [NaN, NaN, null];
                mask.set(x, y, color).set(x+1, y, color).set(x, y+1, color).set(x+1, y+1, color);
            }
        }
        //console.log('c size', column.length, bounds)
        columns[x+1] = columns[x] = column;
        //console.timeEnd('interpolating column')
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
        cb(mask.imageData);

        //report.progress(1);  // 100% complete
        //console.timeEnd("interpolating field");
    })();

}

globe.drawCanvas = function(mapData, options){
   

    
    var cheatingScale = d3.scale.linear()
        .domain([ d3.min(mapData.data), d3.max(mapData.data) ])
        .range([193, 328])

    var cheatingScaleTwo = d3.scale.quantile()
        .domain(mapData.data)
        .range([0,1,3,4,5,6,7,8,9,10,11,12])


    console.log('test', mapData.data[0], cheatingScale(mapData.data[0]))
    var bounds = cheatingScaleTwo.quantiles()
    console.log('quntiles', bounds)
    //mapData.data = mapData.data.map(cheatingScale)
    var scale = Object.assign(require("./palette/wind.js")(bounds, 'BrBG'),  {gradient: globe.scale})
    globe.defaultCanvas.scale = scale  
    globe.overlayData = Object.assign(globe.defaultCanvas, buildGrid(globe.defaultCanvas.builder([mapData])));
    
    console.log('overlayData', globe.overlayData.grid())
    this.setupWebGL()

    setTimeout(function(){
        globe.drawOverlay();
    },100)

}

globe.drawGeoJson = function(mapData, options) {

	if(!options) options = {};

	var defaultOptions = {
		class: 'features',
		opacity: 1,
		'stroke-opacity': 1,
		'stroke-width': 1,
		'stroke': 'yellow',
		'fill': 'black',
		'mouseover': null,
		'mouseout': null,
		'click': null
	}

	var geoJsonLayer = globe.display.select(".geojsonlayer");

	geoJsonLayer.selectAll(".feature").data(mapData.features)
		.enter()
		.append("path")
		.attr("stroke", "yellow")
		.attr("class", options.class || defaultOptions.class)
		.attr("opacity", options.opacity || defaultOptions.opacity)
		.attr("stroke-opacity", options['stroke-opacity'] || defaultOptions['stroke-opacity'])
		.attr("stroke-width", options['stroke-width'] || defaultOptions['stroke-width'])
		.attr("stroke", options['stroke'] || defaultOptions['stroke'])
		.attr("fill", options['fill'] || defaultOptions['fill'])
		.on('mouseover', options['mouseover'] || defaultOptions['mouseover'])
		.on('mouseout', options['mouseout'] || defaultOptions['nouseout'])
		.on('click', options['click'] || defaultOptions['click']);
	globe.display.selectAll("path")
		.attr("d", globe.path)
}

globe.defaultCanvas = {
    field: "scalar",
    type: "temp",
    description: {
        name: {en: "Grids", ja: "気温"},
        qualifier: {}
    },
    paths: [],
    date: new Date(),

    builder: function(file) {
        var record = file[0]
        var data = record.data
        return {
            header: record.header,
            interpolate: bilinearInterpolateScalar,
            data: function(i) {
                return data[i];
            },
            data_raw: new Float32Array(data)
        }
    },

    units: [
        {label: "°C", conversion: function(x) { return x - 273.15; },       precision: 1},
        {label: "°F", conversion: function(x) { return x * 9/5 - 459.67; }, precision: 1},
        {label: "K",  conversion: function(x) { return x; },                precision: 1}
    ],

    scale: Object.assign(require("./palette/wind.js")(),  {gradient: globe.scale})
    // {
    //     bounds: [-100, 100],
    //     gradient: globe.scale
    //     // gradient: segmentedColorScale([
    //     //     [-100,	[37, 4, 42]],
    //     //     [-80,   [41, 10, 130]],
    //     //     [-60,   [81, 40, 40]],
    //     //     [-40,  	[192, 37, 149]],  // -40 C/F
    //     //     [-20, 	[70, 215, 215]],  // 0 F
    //     //     [0,  	[21, 84, 187]],   // 0 C
    //     //     [20,  	[24, 132, 14]],   // just above 0 C
    //     //     [40,    [247, 251, 59]],
    //     //     [60,    [235, 167, 21]],
    //     //     [80,    [230, 71, 39]],
    //     //     [100,   [88, 27, 67]]
    //     // ])
    // }
}

globe.setScale = function(scale){
    globe.scale = scale;
}

var getGlobe = function() {
    return globe
};
module.exports = new getGlobe();
// ------------------- Canvas Util Functions ------------------------------------------------------------
function buildGrid(builder) {
    // var builder = createBuilder(data);

    var header = builder.header;
    var λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
    var Δλ = header.dx, Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
    var date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);
    var lon = {dimensions:'lon', sequence: {delta: Δλ, size:header.nx , start: header.lo1}}
    var lat = {dimensions:'lat', sequence: {delta: -Δφ, size:header.ny , start: header.la1}}
    var _grid = require('./gl/rectangularGrid.js')(lon.sequence, lat.sequence)
    var defaultInterpolator = bilinear.scalar(_grid, builder.data);
    console.log('builder data', builder)

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
        var i = floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
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
            if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                var g01 = row[fi];
                var g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
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
        interpolate: function interpolate(coord) {
            return defaultInterpolator(coord);
        },

        //interpolate,

        forEachPoint: function(cb) {
            for (var j = 0; j < nj; j++) {
                var row = grid[j] || [];
                for (var i = 0; i < ni; i++) {
                    cb(floorMod(180 + λ0 + i * Δλ, 360) - 180, φ0 - j * Δφ, row[i]);
                }
            }
        },
        field: function field() {
            //console.log('field test', builder.data, _grid)
            return {
                valueAt: function valueAt(i) {
                    var j = i * 2;
                    var u = builder.data[j];
                    var v = builder.data[j + 1];
                    return [u, v, Math.sqrt(u * u + v * v)];
                },
                nearest: nearest.scalar(_grid, builder.data_raw),
                bilinear: bilinear.scalar(_grid, builder.data_raw)
            };
        },
        grid: function grid() {
            return _grid;
        }
    };
}


function floorMod(a, n) {
    var f = a - n * Math.floor(a / n);
    // HACK: when a is extremely close to an n transition, f can be equal to n. This is bad because f must be
    //       within range [0, n). Check for this corner case. Example: a:=-1e-16, n:=10. What is the proper fix?
    return f === n ? 0 : f;
}

function isValue(x) {
    return x !== null && x !== undefined;
}

function clamp(x, low, high) {
    return Math.max(low, Math.min(x, high));
}

//d3.geo.polyhedron

//-----------------------------------------------
function throttle (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : Date.now;
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = Date.now;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
};

function bilinearInterpolateScalar(x, y, g00, g10, g01, g11) {
	//console.log(x, y, g00, g10, g01, g11)
	var rx = (1 - x);
	var ry = (1 - y);
	return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
}

function segmentedColorScale(segments) {
    var points = [], interpolators = [], ranges = [];
    for (var i = 0; i < segments.length - 1; i++) {
        points.push(segments[i+1][0]);
        interpolators.push(colorInterpolator(segments[i][1], segments[i+1][1]));
        ranges.push([segments[i][0], segments[i+1][0]]);
    }

    return function(point, alpha) {
        var i;
        for (i = 0; i < points.length - 1; i++) {
            if (point <= points[i]) {
                break;
            }
        }
        var range = ranges[i];
        return interpolators[i](proportion(point, range[0], range[1]), alpha);
    };
}


function colorInterpolator(start, end) {
    var r = start[0], g = start[1], b = start[2];
    var Δr = end[0] - r, Δg = end[1] - g, Δb = end[2] - b;
    return function(i, a) {
        return [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a];
    };
}

 /**
 * @returns {Number} distance between two points having the form [x, y].
 */
function distance(a, b) {
    var Δx = b[0] - a[0];
    var Δy = b[1] - a[1];
    return Math.sqrt(Δx * Δx + Δy * Δy);
}

function proportion(x, low, high) {
    return (clamp(x, low, high) - low) / (high - low);
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

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    return canvas;
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
            x = Math.round(random(bounds.x, bounds.xMax));
            y = Math.round(random(bounds.y, bounds.yMax));
        } while (!field.isDefined(x, y) && safetyNet++ < 30);
        o.x = x;
        o.y = y;
        return o;
    };

    field.overlay = mask.imageData;

    return field;
}

function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));

};

var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var MAX_TASK_TIME = 250;                  // amount of time before a task yields control (millis)
var MIN_SLEEP_TIME = 5;                  // amount of time a task waits before resuming (millis)
var MIN_MOVE = 4;                         // slack before a drag operation beings (pixels)
var MOVE_END_WAIT = 1000;                 // time to wait for a move operation to be considered done (millis)

var OVERLAY_ALPHA = Math.floor(0.6*255);  // overlay transparency (on scale [0, 255])
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

// Helper function to get an element's exact position
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    top: xPos,
    left: yPos
  };
}

function convertHex(hex,a){
    var hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return [r,g,b,a];
}




      