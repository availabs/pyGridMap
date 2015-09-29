var request = require('superagent'),
fs = require('fs'),
d3 = require('d3');



request
.get('http://localhost:5000/grids/5')
.end(function(err, res){
    var data = JSON.parse(res.text);
    console.log(data.length)
    var gridData = data.map(function(d){
    	return d[3] === -999 ? 0 : d[3]
    })
    console.log(d3.min(gridData),d3.max(gridData));
    var header = {}
     header.lo1 = 0, 
     header.la1 = 90, // the grid's origin (e.g., 0.0E, 90.0N)
     header.dx = 2.5,
     header.dy = 2.5,    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
     header.nx = 144, 
     header.ny = 73;    // number of grid points W-E and N-S (e.g., 144 x 73)

    var gribData= {
    	header:header,
    	data:gridData,
    	meta: {date:new Date()}
    }
    fs.writeFile('gridData0.json', JSON.stringify(gribData), function (err) {
	  if (err) return console.log(err);
	  console.log('Hello World > helloworld.txt');


	});
});