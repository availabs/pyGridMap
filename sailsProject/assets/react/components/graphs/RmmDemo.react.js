var React = require("react"),
	d3 = require('d3'),
	d3Tip = require('d3-tip');

var RmmDemo = React.createClass({

	getInitialState:function(){
		return {
			graphData:[],
			width:0,
			height:0
		}
	},

	componentDidMount:function(){
		var scope = this;
		this.renderGraphAxis()

		d3.json("/data/rmm.json",function(error, data) {
        	scope.setState({graphData:data})
    	});

	},

	renderGraphAxis:function(){

		var element = document.querySelector('#graphDiv'),
			elemWidth = parseInt(window.getComputedStyle(element).width),
			margin = {top: 60, right: 60, bottom: 60, left: 75},
        	width = elemWidth- margin.left - margin.right,
        	height = (elemWidth*0.8) - margin.top - margin.bottom;

        this.setState({width:width,height:height});

       	var x = d3.scale.linear()
            .domain([-4, 4])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([-4, 4])
            .range([height, 0]);

        var xAxisBottom = d3.svg.axis()
            .scale(x)
            .ticks(10)
            .orient("bottom");

        var yAxisLeft = d3.svg.axis()
            .scale(y)
            .ticks(7)
            .orient("left");

        var svg = d3.select("#graphDiv").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('class','graphCanvas');

        var tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([120, 40])
            .html(function(d) {
                return "<strong>" + d.date +
                "</strong><br><br>RMM 1: " +
                d.rmm1.toFixed(2) + "<br>RMM 2: " +
                d.rmm2.toFixed(2) + "<br>Phase: " +
                d.phase + "<br>Amplitude: " +
                d.amp.toFixed(2) + "<br>";
            });

        svg.call(tip);

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
            .attr("class", "graphtitle")
            .attr("y", 10)
            .attr("x", width/2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("RMM Index Test Product");

	},

	renderData:function(){

		var svg = d3.select(".graphCanvas");

		var colorScale = d3.scale.category20();

		var x = d3.scale.linear()
            .domain([-4, 4])
            .range([0, this.state.width]);

        var y = d3.scale.linear()
            .domain([-4, 4])
            .range([this.state.height, 0]);

		console.log('x y', x, y);

		var tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([120, 40])
            .html(function(d) {
                return "<strong>" + d.date +
                "</strong><br><br>RMM 1: " +
                d.rmm1.toFixed(2) + "<br>RMM 2: " +
                d.rmm2.toFixed(2) + "<br>Phase: " +
                d.phase + "<br>Amplitude: " +
                d.amp.toFixed(2) + "<br>";
            });

		console.log('tip', tip);

		 svg.selectAll(".dot")
            .data(this.state.graphData)
            .enter().append("circle")
            .attr('class', 'datapoint')
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
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

			// console.log('data', this.state.graphData)
			// console.log('tip', this.tip)
	},

	render:function(){

		if(this.state.graphData.length > 0){
			this.renderData();
		}

		return (

			<div id="graphDiv" style={{width:'100%'}} />

		);
	}

});

module.exports = RmmDemo;
