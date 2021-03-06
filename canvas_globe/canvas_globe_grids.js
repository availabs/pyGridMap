
var width = 800,
    height = 600;

//the scale corrsponds to the radius more or less so 1/2 width
var projection = d3.geo.orthographic()
    .scale(180)
    .clipAngle(90)
    .translate([width/2,height/2]);

var canvas = d3.select("#globeParent").append("canvas")
    .attr("width", width)
    .attr("height", height)
    .style("cursor", "move");

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var selectedCountryFill = "#007ea3",
    flightPathColor = "#007ea3",
    landFill = "#b9b5ad",
    seaFill = "#e9e4da",
    gridFill = 'rgba(255,0,0,0.70)'

var flightPath ={}
    flightPath.type = "LineString";
    flightPath.coordinates = [[0,0], [179,0]];

var currentData = [{
  "type": "FeatureCollection",
  "features": []
}]



console.log('interpolate',(0.1))

function getSqaure(a, delta){
    // var xscale = d3.scale.linear().domain([0,1]).range([start[0],end[0]])
    // var yscale = d3.scale.linear().domain([0,1]).range([start[1],end[1]])
    // var current = start

    // a[0] = a[0] + 0.01
    // a[1] = a[1] + 0.
    a = a.reverse()
    var polygon = {
        type:'Polygon',
        coordinates: [
            [
                a,
                [a[0] + delta , a[1]],
                [a[0] + delta , a[1] + delta],
                [a[0] , a[1] + delta],
                a
                
            ]
        ]
    }
    return {
        type: "Feature",
        properties: {},
        geometry:polygon 
    }
}


function drawGradientLine(start, end, startColor, endColor, delta){
    var colorRange = d3.scale.linear().domain([0,1]).range([startColor,endColor])
    var xscale = d3.scale.linear().domain([0,1]).range([start[0],end[0]])
    var yscale = d3.scale.linear().domain([0,1]).range([start[1],end[1]])
    var current = start
    var gradientPath = {
        type:'LineString',
        coordinates: [
            start
        ]
    }
    var next = start
    for(var i = 0; i < delta;i++){
        var t = i/delta
        next = [xscale(t), yscale(t)]
        //console.log(next)
        gradientPath.coordinates[1] = next
        c.strokeStyle = colorRange(t), c.lineWidth = 7
        c.beginPath(), path(gradientPath)
        c.stroke()
        gradientPath.coordinates[0] = next
    }
    gradientPath.coordinates[1] = end
    c.strokeStyle = colorRange(t), c.lineWidth = 7
    c.beginPath(), path(gradientPath)
    c.stroke()
}

function ready(error, world) {
    if (error) throw error;

    var globe = {type: "Sphere"},
        land = topojson.feature(world, world.objects.land),
        countries = topojson.feature(world, world.objects.countries).features,
        i = -1;

    //projection.rotate(coords);
     var dragBehaviour = d3.behavior.drag()
        .on('drag', function(){
            var dx = d3.event.dx;
            var dy = d3.event.dy;

            var rotation = projection.rotate();
            var radius = projection.scale();
            var scale = d3.scale.linear()
                .domain([-1 * radius, radius])
                .range([-90, 90]);
            var degX = scale(dx);
            var degY = scale(dy);
            rotation[0] += degX;
            rotation[1] -= degY;
            if (rotation[1] > 90)   rotation[1] = 90;
            if (rotation[1] < -90)  rotation[1] = -90;

            if (rotation[0] >= 180) rotation[0] -= 360;
            projection.rotate(rotation);
            redraw();
        })


    var canvas = d3.select("#globeParent").select('canvas')
    var context = canvas.node().getContext("2d");
    function zoom() {
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(d3.event.translate[0], d3.event.translate[1]);
      context.scale(d3.event.scale, d3.event.scale);
      redraw();
      context.restore();
    }
    
    redraw()
    canvas
    .call(dragBehaviour)
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
    //redraw(flightPathDynamic)
    //customTransition(journey)


    function redraw(){
        c.clearRect(0, 0, width, height);
        //base globe
        c.shadowBlur = 0, c.shadowOffsetX = 0, c.shadowOffsetY = 0;
        console.log('land', land)
        c.fillStyle = seaFill, c.beginPath(), path(globe), c.fill();
        c.fillStyle = landFill, c.beginPath(), path(land), c.fill();
        currentData.forEach(d => {
            console.log('current Data',d)
            c.fillStyle = gridFill, c.beginPath(), path(d), c.fill();
        })
        //c.strokeStyle = flightPathColor, c.lineWidth = 3
        //console.log('test', path(flightPath))
        // if (currentData) {
        //     // /drawData(2.5)
        // }
        //c.shadowColor = "#373633",
        //c.shadowBlur = 20, c.shadowOffsetX = 5, c.shadowOffsetY = 20,
        
       
    }

   function getData() {
        d3.json('http://db-wxatlas.rit.albany.edu/grids/gph/500/2010/12/31/0', (err,data) => {
            console.log('got data')
            var funscale = d3.scale.linear().domain([
                    d3.min(data.data),
                    d3.max(data.data)
                ]).range([-100, 100])

            data.data = data.data.map(function(d) {
                return d/10
            })
            

            //data.header.date = new Date(year, month, day, hour)\
            var delta = 2.5
            currentData[0].features = data.data.map( (d,i) => {
                y = 90 - Math.floor(i / (360/delta))*delta
                x = (i % (360/delta)) * delta
                return getSqaure([x,y], 2.5)
            })
            // .filter((d,i) => i > 200 && i < 210)
            // .map((d,i) => {
            //     console.log('coord', 
            //         d.geometry.coordinates[0][0], 
            //         d.geometry.coordinates[0][1],
            //         d.geometry.coordinates[0][2],
            //         d.geometry.coordinates[0][3]
            //     )
            //     return d
            // })
            console.log(currentData)

            //currentData = data.data
            //console.log(currentData)
            redraw()
        })
    }

getData()
   
    //letting you drag the globe around but setting it so you can't tilt the globe over
   

    //make the plane always align with the direction of travel
    function calcAngle(originalRotate, newRotate){
        var deltaX = newRotate[0] - originalRotate[0],
            deltaY = newRotate[1] - originalRotate[1]

        return Math.atan2(deltaY, deltaX);
    }



}




queue()
    .defer(d3.json, "world-110m.json")
    .await(ready);