var React = require("react"),
	Globe = require('../components/globe/globe.react'),
	Brush = require('react-d3-components').Brush,
	moment = require('moment');

var MapPage = React.createClass({

	getInitialState:function(){
		return  {
			elemWidth: 400,
			canvasData:null,
			startDate: moment().subtract(180, 'days')._d,
			endDate: moment().subtract(90, 'days')._d
		}
	},

	componentDidMount:function (){
		this.loadData(1999)
	},

	loadData: function(year){
		var scope = this;
		console.log('loading  data')
		d3.json('http://localhost:5000/grids/500/'+year+'/06/18/00', function(err,data){
			console.log('got data', data)
			var funscale = d3.scale.linear().domain(
			[
				d3.min(data.data), 
				d3.max(data.data)
			]).range([-100, 100])

			data.data = data.data.map(function(d){
				return funscale(d);
			})

			scope.setState({
				canvasData:data
			})
		})
	},

	_onChange: function(extent) {


       	var endDate = extent[1],
       		timeDiff = Math.abs(extent[0].getTime() - extent[1].getTime()),
			diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
 		console.log('daydiff',diffDays)

 		if(diffDays > 90){
 			endDate = moment(extent[0]).add(90,'days')._d;
 		}

 		this.loadData(extent[0].getFullYear())
       	this.setState({
       		startDate:extent[0],
       		endDate:endDate
       	})
    },

	render:function(){

	var  xScaleBrush = d3.time.scale().domain([new Date(1974, 6, 1), new Date(2015, 10, 5)]).range([0, this.state.elemWidth - 70]);

		return (

			<div className="container main">
	            A globe is gonna go here.
	            <div className='row'>
	            	<div className='col-xs-12'>
	            		 <Globe canvasData={this.state.canvasData} date={this.state.startDate}/>
	            	</div>
	            </div>
	          
	           <div>
	            <Brush
                   width={this.state.elemWidth}
                   height={75}
                   margin={{top: 0, bottom: 30, left: 50, right: 20}}
                   xScale={xScaleBrush}
                   extent={[this.state.startDate, this.state.endDate]}
                   onChange={this._onChange}
                   xAxis={{tickValues: xScaleBrush.ticks(d3.time.year, 5), tickFormat: d3.time.format("%y")}} />
                 </div>
                  {this.state.startDate.toString()}
	        </div>

		);
	}

});

module.exports = MapPage;
