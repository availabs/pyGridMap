var React = require("react"),
	d3 = require('d3'),
	d3Tip = require('d3-tip'),
    moment = require('moment');

var RmmDemo = React.createClass({

    getDefaultProps:function(){
        return {

            startDate:moment().subtract(120, 'days'),
            endDate: moment(),
            graphData:[]

        }

    },

	getInitialState:function(){
		return {

			width:0,
			height:0
		}
	},

	componentDidMount:function(){
		var scope = this;
		this.renderGraphAxis()


	},

    filterDataByDate:function(data){
        var scope = this;

        return data.filter(function(d,i){

            var n = new Date(d.date),
                s = new Date(scope.props.startDate),
                e = new Date(scope.props.endDate);


            return d && n >= s  && n <= e;
        })

    },

	renderGraphAxis:function(){

		var element = document.querySelector('#graphDiv'),
			elemWidth = parseInt(window.getComputedStyle(element).width),
			margin = {top: 60, right: 60, bottom: 60, left: 75},
        	width = elemWidth - margin.left - margin.right,
        	height = (elemWidth) - margin.top - margin.bottom,
			radius = Math.min(width, height) / 2;

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) {
				return d.value;
			});

		var labelData = [
			{value: 45, label: "6"},
			{value: 45, label: "5"},
			{value: 45, label: "4"},
			{value: 45, label: "3"},
			{value: 45, label: "2"},
			{value: 45, label: "1"},
			{value: 45, label: "8"},
			{value: 45, label: "7"}
		]

		console.log('height', height, 'width', width)

        this.setState({width:width,height:height});

       	var x1 = d3.scale.linear()
            .domain([-4, 4])
            .range([0, width]);

		var x2 = d3.scale.linear()
            .domain([-4, 4])
            .range([0, width]);

        var y1 = d3.scale.linear()
            .domain([-4, 4])
            .range([height, 0]);

		var y2 = d3.scale.linear()
            .domain([-4, 4])
            .range([height, 0]);

        var xAxisBottom = d3.svg.axis()
            .scale(x1)
            .ticks(8)
			.orient("bottom");

		var xAxisTop = d3.svg.axis()
            .scale(x1)
            .ticks(8)
            .orient("top");

        var yAxisLeft = d3.svg.axis()
            .scale(y1)
            .ticks(8)
            .orient("left");

		var yAxisRight = d3.svg.axis()
			.scale(y2)
			.ticks(8)
			.orient("right");

        var svg = d3.select("#graphDiv").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('class','graphCanvas');

		// svg.append("svg:g")
		// 	.attr("class", "axis")
		// 	.attr("transform", "translate(0, " + (-height) + ")")
		// 	.call(xAxisBottom);

		svg.append("line:g")
			.attr("class", "axis")
			.attr("transform", "translate( 0,0)")
			.call(xAxisTop);

		// svg.append("svg:g")
		// 	.attr("class", "axis")
		// 	.attr("transform", "translate(-4, 0)")
		// 	.call(yAxisLeft);

		svg.append("line:g")
			.attr("class", "axis")
			.attr("transform", "translate(" + width + ", 0)")
			.call(yAxisRight);

		var key = function(d){ return d.data.label; };

		var outerArc = d3.svg.arc()
			.innerRadius(radius * 0.9)
			.outerRadius(radius * 0.9);

		svg.append("g")
			.attr("class", "labels")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")");


		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}

		var text = svg.select(".labels").selectAll("text")
			.data(pie(labelData), key);

		text.enter()
			.append("text")
			.attr("transform", function(d){
				var pos = outerArc.centroid(d);
				//pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
				return "translate(" + pos + ")";
			})
			.attr("dy", ".35em")
			.text(function(d) {
				console.log(outerArc.centroid(d),d)
				return d.data.label;
			});

        // var tip = d3Tip()
        //     .attr('class', 'd3-tip')
        //     .offset([120, 40])
        //     .html(function(d) {
        //         return "<strong>" + d.date +
        //         "</strong><br><br>RMM 1: " +
        //         d.rmm1.toFixed(2) + "<br>RMM 2: " +
        //         d.rmm2.toFixed(2) + "<br>Phase: " +
        //         d.phase + "<br>Amplitude: " +
        //         d.amp.toFixed(2) + "<br>";
        //     });

        // svg.call(tip);

        // add the x axis and x-label
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisBottom)
            .selectAll("text")
            .attr("y", 9)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("dx", "-0.6em")
            .style("text-anchor", "start");

        svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .text("RMM 1");

        // add the y axis and y-label
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxisLeft);

		svg.append("text")
            .attr("class", "ylabel")
            .attr("y", 0 - margin.left) // x and y switched due to rotation!!
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("RMM 2");

		svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 100)
            .text("Indian Ocean");

		svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", 0 + margin.top)
            .text("West Pacific");

		svg.append("text")
            .attr("class", "ylabel")
            .attr("y", 0 - margin.left + 100) // x and y switched due to rotation!!
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("West Hem. & Africa");

		svg.append("text")
            .attr("class", "ylabel")
            .attr("y", width - margin.right) // x and y switched due to rotation!!
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Maritime Continent");

        svg.append("text")
            .attr("class", "graphtitle")
            .attr("y", 10)
            .attr("x", width/2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("RMM Index Test Product");

	},

	renderData:function(){
        var scope = this
		var svg = d3.select(".graphCanvas");

		var colorScale = d3.scale.category20();

		var x = d3.scale.linear()
            .domain([-4, 4])
            .range([0, this.state.width]);

        var y = d3.scale.linear()
            .domain([-4, 4])
            .range([this.state.height, 0]);

        svg.append('circle')
            .attr('class','centerCircle')
            .attr('cx',this.state.width/2)
            .attr('cy',this.state.height/2)
            .attr('r',x(-3))

         svg.append('line')
            .attr('class','myline')
            .style('stoke-width',2)
            .style('stroke','#000')
            .attr('x1',x(-4) )
            .attr('x2',x(4) )
            .attr('y1',y(-4))
            .attr('y2',y(4))

        svg.append('line')
            .attr('class','myline')
            .style('stoke-width',2)
            .style('stroke','#000')
            .attr('x1',x(4) )
            .attr('x2',x(-4) )
            .attr('y1',y(-4))
            .attr('y2',y(4))

        svg.append('line')
            .attr('class','myline')
            .style('stoke-width',2)
            .style('stroke','#000')
            .attr('x1',x(-4) )
            .attr('x2',x(4) )
            .attr('y1',y(0))
            .attr('y2',y(0))


        svg.append('line')
            .attr('class','myline')
            .style('stoke-width',2)
            .style('stroke','#000')
            .attr('x1',x(0) )
            .attr('x2',x(0) )
            .attr('y1',y(-4))
            .attr('y2',y(4))




        var data = this.filterDataByDate(this.props.graphData)

        var dots = svg.selectAll(".dot")
            .data(data)


        var lines = svg.selectAll(".linedata")
            .data(data)




       dots
        .transition()
            .duration(750)
            .attr('class', 'dot')
            .attr('cx', function(d) { return x(d.rmm1); })
            .attr('cy', function(d) { return y(d.rmm2); })
            .attr('r', 3)
            .attr('fill', function(d){
                return colorScale( d.date.split('-')[1] )
            })
            .attr('stroke', function(d){
                return colorScale( d.date.split('-')[1] )
            })
            .attr('stroke-width', '3')

        dots
            .enter().append("circle")
                .attr('cx', 0 )
                .attr('cy', 0 )
				.on('mouseover', function(d){
					if(scope.props.mouseoverPoint){
						var n = {};
						n.x = d3.event.clientX;
						n.y = d3.event.clientY;
						//console.log(n,d3.event.clientX)
						n.d = d;
						scope.props.mouseoverPoint(n);
					}
				})
				.on('mouseout', function(d) {
					if(scope.props.mouseoutPoint){
						scope.props.mouseoutPoint();
					}
				})
            .transition()
                .duration(750)
                .attr('class', 'dot')
                .attr('cx', function(d) { return x(d.rmm1); })
                .attr('cy', function(d) { return y(d.rmm2); })
                .attr('r', 3)
                .attr('fill', function(d){
                    return colorScale( d.date.split('-')[1] )
                })
                .attr('stroke', function(d){
                    return colorScale( d.date.split('-')[1] )
                })
                .attr('stroke-width', '9')

        dots
            .exit().transition()
                .duration(750)
                .attr('cx', this.state.width )
                .attr('cy', 0).remove()
            // .on('mouseover', tip.show)
            // .on('mouseout', tip.hide);

			// console.log('data', this.state.graphData)
			// console.log('tip', this.tip)

        lines
            .transition()
            .duration(750)
            .attr('class', 'linedata')
            .attr("d", function(d,i) {
                var next = data[i+1]
                if(next){
                    return 'M'+x(d.rmm1)+' '+y(d.rmm2)+' L'+x(next.rmm1)+' '+y(next.rmm2)
                }

            })
            .attr("stroke", function(d) {
                return colorScale( d.date.split('-')[1] );
            })
            .attr("stroke-width", "3");

        lines
            .enter().append("path")
                .attr("d", function(d,i) {
                var next = data[i+1]
                if(next){
                    return 'M'+0+' '+0+' L'+0+' '+0
                }

            })
            .transition()
            .duration(750)
            .attr('class', 'linedata')
            .attr("d", function(d,i) {
                var next = data[i+1]
                if(next){
                    return 'M'+x(d.rmm1)+' '+y(d.rmm2)+' L'+x(next.rmm1)+' '+y(next.rmm2)
                }

            })
            .attr("stroke", function(d) {
                return colorScale( d.date.split('-')[1] );
            })
            .attr("stroke-width", "3");



         lines
            .exit().transition()
                .duration(750)
                .attr("d", function(d,i) {
                    var next = data[i+1]
                    if(next){
                        return 'M'+scope.state.width+' '+scope.state.width+' L'+scope.state.width+' '+scope.state.width;
                    }

                })
            .remove()
	},

	render:function(){

		if(this.props.graphData.length > 0){
			this.renderData();
		}

		return (

			<div id="graphDiv" style={{width:'100%'}} >

            </div>

		);
	}

});

module.exports = RmmDemo;
