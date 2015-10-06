var request = require('superagent'),
fs = require('fs'),
d3 = require('d3');

var header = {}
header.lo1 = 0,
header.la1 = 90, // the grid's origin (e.g., 0.0E, 90.0N)
header.dx = 2.5,
header.dy = 2.5,    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
header.nx = 144,
header.ny = 73;    // number of grid points W-E and N-S (e.g., 144 x 73)

var gribData = {
    header:header,
    data:[],
    meta: {date:new Date()}
}

var count = 0

function checkFinished(data, phase) {
    gribData.data[phase-1] = data;
    count ++
    if (count === 8) {
        writeData()
    }
}

function getAllData(){
    for (var i=1; i<9; i++){
        getDataForPhase(i, checkFinished)
    }
}

function getDataForPhase(i, cb) {

    console.log('get data index',i)
    request
    .get('http://localhost:5000/grids/'+i)
    .end(function(err, res){
        var data = JSON.parse(res.text);
        console.log(data.length)
        var gridData = data.map(function(d){
            return d[3] === -999 ? 0 : d[3]
        })
        cb(gridData, i)
    });
}

function writeData() {

   
    console.log('is equal??',equal);

    fs.writeFile('gridDataArray.json', JSON.stringify(gribData), function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
    })
}

getAllData();
