var React = require('react'),
	Globe = require('../components/globe/globe.react'),
	Brush = require('react-d3-components').Brush,
	moment = require('moment'),
	DateTimeField = require('react-bootstrap-datetimepicker');

var MapPage = React.createClass({

	getInitialState: function(){
		return  {
			elemWidth: 800,
			loading: false,
			canvasData: null,
			date: "1993-03-14",
			format: "YYYY-MM-DD",
			inputFormat: "MM-DD-YYYY",
			mode: "date"
		}
	},

	componentDidMount:function (){
		this.loadData(850, 1993, 3, 14, 0)
	},

	loadData: function(height, year, month, day, hour){
		var scope = this;
		this.setState({loading: true})
		d3.json('http://localhost:5000/grids/'+height+'/'+year+'/'+month+'/'+day+'/'+hour, function(err,data){
			var funscale = d3.scale.linear().domain([
					d3.min(data.data),
					d3.max(data.data)
				]).range([-100, 100])

			data.data = data.data.map(function(d){
				return funscale(d);
			})

			scope.setState({
				canvasData:data,
				loading: false
			})
		})
	},

	loadRmmTcData: function(phase, amp, season, lat, lon, radius){
		var scope = this;
		this.setState({loading:true})
		d3.json('http://localhost:5000/phase/'+phase+'/amp/'+amp+'/season/'+season+'/lat/'+lat+'/lon/'+lon+'/radius/'+radius, function(err,data){
			var funscale = d3.scale.linear().domain(
			[
				d3.min(data.data),
				d3.max(data.data)
			]).range([-100, 100])

			data.data = data.data.map(function(d){
				return funscale(d);
			})

			scope.setState({
				canvasData:data,
				loading: false
			})
		})
	},

	_onChange: function(dateString) {

		var newDate = new Date(dateString)
 		this.loadData(newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate()+1)
       	this.setState({
			date: newDate
       	})
    },

	render: function(){

	const {date, format, mode, inputFormat} = this.state;
	var  xScaleBrush = d3.time.scale().domain([new Date(1979, 1, 1), new Date(2015, 12, 31)]).range([0, this.state.elemWidth - 70]);

		return (

			<div className="container-fluid main">
	            A globe is gonna go here.
	            {this.state.loading ? ' Loading.' : ' Done.'}
	            <br />
                {this.state.newDate}
	            <br />
	            {this.state.canvasData ? this.state.canvasData.length : 'no canvasData' }
				<div>
					<DateTimeField
						dateTime={date}
						format={format}
						viewMode={mode}
						inputFormat={inputFormat}
						onChange={this._onChange}
					/>
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
	            <div className='row'>
	            	<div className='col-xs-12' style={{border: '1px solid red'}}>
	            		<Globe canvasData={this.state.canvasData} date={this.state.startDate}/>
	            	</div>
	            </div>


	        </div>

		);
	}

});

module.exports = MapPage;
