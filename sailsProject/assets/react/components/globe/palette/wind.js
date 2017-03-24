"use strict";

module.exports = function (bounds) {
    var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;
    var resolution = 5000;
    var palette = require("./palette");
    
    var bounds = bounds || [500, 595]; // units: m/s
    var array = new Uint8Array(5000 * 4);
    palette.fillRange(array, [0, 1], [0, 1], palette.extendedSinebowColor);
    return palette.buildScale(bounds, array);

    var resolution = 500
    // var palette = require("./palette");
    // var chroma = require("chroma-js");

    // var bounds = bounds || [0.002, 2.500]; // units: τ
    // var logBounds = bounds.map(Math.log);
    // var scale = chroma.scale(chroma.cubehelix()).domain(logBounds);
    // var colors = palette.quantize(logBounds, [scale], resolution);

    // return palette.buildScale(bounds, colors, Math.log, Math.exp);

    // var palette = require("./palette");

    // var bounds = bounds || [40, 2500]; // units: ppb
    // var stops = [{ color: [0, 38, 40], mode: "lab", p: bounds[0] }, { color: [255, 255, 224], mode: "lch", p: 400 }, // background is ~100 ppb https://en.wikipedia.org/wiki/MOPITT
    // { color: [0, 0, 154], mode: "lab", p: 1800 }, { color: [0, 0, 0], mode: "lab", p: bounds[1] }];

    // var scales = palette.scalesFrom(stops);
    // scales = palette.smooth(scales, 0, [360, 440]);
    // scales = palette.smooth(scales, 2, [1700, 1900]);
    // return palette.buildScaleFromChromaScales(bounds, scales, resolution);
};