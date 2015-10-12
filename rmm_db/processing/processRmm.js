var request = require('superagent'),
fs = require('fs'),
d3 = require('d3');

request
.get('http://localhost:5000/db')
.end(function(err, res){
    var data = JSON.parse(res.text);
    fs.writeFile('rmmData.json', JSON.stringify(data), function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');

    });
});
