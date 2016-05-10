var React = require("react"),
	moment = require('moment'),
	d3 = require('d3'),
	Brush = require('react-d3-components').Brush,
	//--coponents
	RmmGraph = require('../components/graphs/RmmDemo.react'),
	RmmTable = require('../components/tables/rmmtable.react'),
	RmmToolTip = require('../components/layout/tooltip.react');

var DemoPage = React.createClass({

	getInitialState:function(){
		return  {
			elemWidth: 400,
			startDate: moment().subtract(180, 'days')._d,
			endDate: moment().subtract(90, 'days')._d,
			graphData:[]
		}
	},

	componentDidMount:function(){
	 	var scope = this,
	 		element = document.querySelector('#brush'),
			elemWidth = parseInt(window.getComputedStyle(element).width);
		this.setState({elemWidth:elemWidth})

		d3.json("/data/rmm.json",function(error, data) {


        	scope.setState({graphData:data})

    	});

	},

	_onChange: function(extent) {

       	var endDate = extent[1],
       		timeDiff = Math.abs(extent[0].getTime() - extent[1].getTime()),
			diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
 		console.log('daydiff',diffDays)

 		if(diffDays > 90){
 			endDate = moment(extent[0]).add(90,'days')._d;
 		}

       	this.setState({
       		startDate:extent[0],
       		endDate:endDate
       	})
    },

	mouseover:function(data) {
		d3.select('#nytg-tooltip')
			.style('display', 'block')
			// .style('left', data.x+'px')
			// .style('top', data.y-10+'px')
		d3.select('.nytg-department')
			.text(data.d.date)
		d3.select('.nytg-name')
			.html(
				'RMM1: '+data.d.rmm1.toFixed(2)+'<br />'+
				'RMM2: '+data.d.rmm2.toFixed(2)+'<br />'+
				'Phase: '+data.d.phase+'<br />'+
				'Amplitude: '+data.d.amp.toFixed(2)
			)
	},

	mouseout:function(data) {
		d3.select('#nytg-tooltip')
			.style('display', 'none')
	},

	render:function(){

		var  xScaleBrush = d3.time.scale().domain([new Date(1974, 6, 1), new Date(2015, 10, 5)]).range([0, this.state.elemWidth - 70]);

		return (

			<div className="container main">
	            <RmmGraph
	            	graphData={this.state.graphData}
	            	startDate={this.state.startDate}
	            	endDate={this.state.endDate}
					mouseoverPoint={this.mouseover}
					mouseoutPoint={this.mouseout}/>
	            <div className="brush" id="brush">
		            <Brush
	                   width={this.state.elemWidth}
	                   height={75}
	                   margin={{top: 0, bottom: 30, left: 50, right: 20}}
	                   xScale={xScaleBrush}
	                   extent={[this.state.startDate, this.state.endDate]}
	                   onChange={this._onChange}
	                   xAxis={{tickValues: xScaleBrush.ticks(d3.time.year, 5), tickFormat: d3.time.format("%y")}} />
                </div>
                  <RmmTable
	            	graphData={this.state.graphData}
	            	startDate={this.state.startDate}
	            	endDate={this.state.endDate}/>

	        </div>

		);
	}

});

module.exports = DemoPage;
