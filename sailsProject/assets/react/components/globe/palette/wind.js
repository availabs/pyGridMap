"use strict";

module.exports = function () {
    var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

    console.log('the wind')
    var palette = require("./palette");

    var bounds = [0, 100]; // units: m/s
    var array = new Uint8Array(resolution * 4);
    palette.fillRange(array, [0, 1], [0, 1], palette.extendedSinebowColor);

    return palette.buildScale(bounds, array);
};