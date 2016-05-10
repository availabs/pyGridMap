var React = require('react'),
	Globe = require('../components/globe/globe.react'),
	Brush = require('react-d3-components').Brush,
	moment = require('moment');

var MapPage = React.createClass({

	getInitialState: function(){
		return  {
			elemWidth: 800,
			loading: false,
			canvasData: null,
			date: new Date(2015, 12, 1, 0),
			format: "YYYY-MM-DD",
			inputFormat: "MM-DD-YYYY",
			mode: "date",
			height: 500
		}
	},

	componentDidMount:function (){
		this.loadData(this.state.height, 1993, 3, 14, 0)
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

		var newDate = new Date(dateString[0])
		console.log('test',newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate())
		let hour = newDate.getHours() % 6 === 0 ? newDate.getHours() : parseInt(newDate.getHours()/6) * 6
		this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), hour)
		newDate.setHours(hour)
       	this.setState({
			date: newDate
       	})
    },

    _dateChange: function(e) {	
    	console.log('_dateChange', e.target.value, e.target.name )
    	let newDate = this.state.date
    	switch( e.target.name ) {
    		case 'year':
    			
    			newDate.setFullYear(e.target.value)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    		case 'month':
    			newDate.setMonth(e.target.value-1)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break; 
    		case 'day':
    			newDate.setDate(e.target.value)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    		case 'hour':
    			if(e.target.value === 24){
    				newDate.setHours(0)
    				newDate = moment(newDate).add(1,'days')._d
    			
    			} else {
    				newDate.setHours(e.target.value)
    			}
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    	}
    },

    _heightChange(e){
    	let newDate = this.state.date
    	this.setState({height:e.target.value})
    	this.loadData(e.target.value, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			
    },

	render: function(){

	const {date, format, mode, inputFormat} = this.state;
	var  xScaleBrush = d3.time.scale().domain([new Date(1979, 1, 1), new Date(2015, 12, 31)]).range([0, this.state.elemWidth - 70]);
	
	let dateStyle = {
		fontSize: 24,
		margin: 7
	}
	let secondDate = moment(this.state.date).add(30, 'days')._d
	console.log('date', date.getFullYear())
		return (

			<div className="container-fluid main">
	            A globe is gonna go here.
	            {this.state.loading ? ' Loading.' : ' Done.'}
	            <br />
                {this.state.newDate}
	            <br />
	            {this.state.canvasData ? this.state.canvasData.length : 'no canvasData' }
				<div>
					
				</div>
	            <div>
	            	<div className='row'>
		            	<div className='col-xs-2'>
		            		<select onChange={this._heightChange} name='height' className="form-control" value={this.state.height}>
		            			<option value='500'>500</option>
		            			<option value='850'>850</option>
		            		</select>
		            		{this.state.height}
		            	</div>
		            </div>
		            <div className='row'>
		            	<div className='col-xs-6'>
			            	<div className='row'>
			            		<div className='col-xs-3'>
			            			<input className='form-control' style={dateStyle} min="1979" max="2015" type='number' name='year' onChange={this._dateChange} value={this.state.date.getFullYear()} />
			            		</div>
			            		<div className='col-xs-3'>
			            			<input className='form-control' style={dateStyle} min="1" max="12" type='number' name='month' onChange={this._dateChange} value={this.state.date.getMonth()+1} /> 
			            		</div>
			            		<div className='col-xs-3'>
			            			<input className='form-control' style={dateStyle} min="1" max="31" type='number' name='day' onChange={this._dateChange} value={this.state.date.getDate()} /> 
			            		</div>
			            		<div className='col-xs-3'>
			            		<input className='form-control' style={dateStyle} min="0" max="24" type='number' name= 'hour' onChange={this._dateChange} value={this.state.date.getHours()}  step="6" />
			            		</div>
			            	</div>
			            </div>
			        </div>
		            <Brush
	                   width={this.state.elemWidth}
	                   height={75}
	                   margin={{top: 0, bottom: 30, left: 50, right: 20}}
	                   xScale={xScaleBrush}
	                   onChange={this._onChange}
	                   extent={[this.state.date, secondDate]}
	                   xAxis={{tickValues: xScaleBrush.ticks(d3.time.year, 5), tickFormat: d3.time.format("%y")}} />
                </div>
	            <div className='row'>
	            	<div className='col-xs-12' style={{border: '1px solid red'}}>
	            		<Globe canvasData={this.state.canvasData} date={date}/>
	            	</div>
	            </div>


	        </div>

		);
	}

});

module.exports = MapPage;
