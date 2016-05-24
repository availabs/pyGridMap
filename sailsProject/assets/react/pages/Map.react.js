var React = require('react'),
	Globe = require('../components/globe/globe.react'),
	Brush = require('react-d3-components').Brush,
	moment = require('moment'),
	d3 = require('d3');

var MapPage = React.createClass({

	getInitialState: function(){

		return {
			elemWidth: 800,
			loading: false,
			canvasData: null,
			projection: "orthographic",
			date: new Date(2015, 11, 31, 0),
			format: "YYYY-MM-DD",
			inputFormat: "MM-DD-YYYY",
			mode: "date",
			height: 500,
			scale: d3.scale.quantile()
		        .domain([-100,-80,-60,-40,-20, 20, 40, 60, 80, 100])
		        .range(["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"])
		        	//["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"])
		}

	},

	componentDidMount: function (){

		let newDate = this.state.date
		this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), newDate.getHours())

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

			data.header.date = new Date(year, month, day, hour)

			scope.setState({
				canvasData: data,
				scale: d3.scale.quantile()
					.domain(data.data)
					.range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"].reverse()),
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
				canvasData: data,
				loading: false
			})
		})

	},

	_onChange: function(dateString) {

		var newDate = new Date(dateString[0])
		let hour = newDate.getHours() % 6 === 0 ? newDate.getHours() : parseInt(newDate.getHours()/6) * 6
		this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), hour)
		newDate.setHours(hour)
       	this.setState({
			date: newDate
       	})

    },

    _dateChange: function(e) {

    	let newDate = this.state.date
    	switch( e.target.name ) {
    		case 'year':
    			newDate.setFullYear(e.target.value)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
				console.log('date', this.state.date)
    		break;
    		case 'month':
				newDate.setMonth(e.target.value-1)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    		case 'day':
				// TODO: If not a leap year, and date is 29 January or 29 March,
				// and want to go to 29 February, should we go to 28 Februay or 1 March?
				// Default is 1 March.
				newDate.setDate(e.target.value)
    			this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    		case 'hour':
    			if(e.target.value === 24) {
    				newDate.setHours(0)
    				newDate = moment(newDate).add(1,'days')._d
				} else if (e.target.value === -6) {
					newDate.setHours(18)
					newDate = moment(newDate).subtract(1,'days')._d
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
    	this.setState({height: e.target.value})
    	this.loadData(e.target.value, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())

    },

	_projectionChange(e){

		// TODO: Debug projection change utility.
		let newDate = this.state.date
		this.setState({projection: e.target.value})
		this.loadData(this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
		console.log('projection', this.state.projection)

	},

	render: function(){

		const {date, format, mode, inputFormat} = this.state;

		// var  xScaleBrush = d3.time.scale().domain([new Date(1979, 1, 1), new Date(2015, 12, 31)]).range([0, this.state.elemWidth - 70]);

		let dateStyle = {
			fontSize: 20,
			margin: '0px 7px 7px 7px'

		}

		let labelStyle = {
			paddingLeft: 10,
			fontWeight: 'bold',
			fontSize: 12
		}

		// let secondDate = moment(this.state.date).add(30, 'days')._d

		return (

			<div className="container-fluid main">
				 <div>
	            	<div className='row' style={{
	            		boxShadow: '2px 2px 2px #5d5d5d',
	            		backgroundColor: '#efefef', marginBottom: 15}}>
	            		<div className='col-xs-1'></div>
						<div className='col-xs-2'>
		            		<span style={labelStyle}>Projection</span>
		            		<select style={dateStyle} onChange={this._projectionChange} name='projection' className="form-control" value={this.state.projection}>
		            			<option value='orthographic'>Orthographic</option>
								<option value='azimuthal_equidistant'>Azimuthal Equidistant</option>
		            			<option value='conic_equidistant'>Conic Equidistant</option>
								<option value='equirectangular'>Equirectangular</option>
								<option value='stereographic'>Stereographic</option>
								<option value='waterman'>Waterman</option>
								<option value='winkel3'>Winkel3</option>
		            		</select>
		            	</div>
		            	<div className='col-xs-2'>
		            		<span style={labelStyle}>Level</span>
		            		<select style={dateStyle} onChange={this._heightChange} name='height' className="form-control" value={this.state.height}>
		            			<option value='500'>500 hPa</option>
		            			<option value='850'>850 hPa</option>
		            		</select>
		            	</div>
		            	<div className='col-xs-6'>
			            	<div className='row'>
			            		<div className='col-xs-3'>
			            			<span style={labelStyle}>Year</span>
			            			<input className='form-control' style={dateStyle} min="1979" max="2015" type='number' name='year' onChange={this._dateChange} value={this.state.date.getFullYear()} />
			            		</div>
			            		<div className='col-xs-3'>
			            			<span style={labelStyle}>Month</span>
			            			<input className='form-control' style={dateStyle} min="0" max="13" type='number' name='month' onChange={this._dateChange} value={this.state.date.getMonth()+1} />
			            		</div>
			            		<div className='col-xs-3'>
			            			<span style={labelStyle}>Day</span>
			            			<input className='form-control' style={dateStyle} min="0" max="32" type='number' name='day' onChange={this._dateChange} value={this.state.date.getDate()} />
			            		</div>
			            		<div className='col-xs-3'>
			            			<span style={labelStyle}>Hour</span>
			            			<input className='form-control' style={dateStyle} min="-6" max="24" type='number' name= 'hour' onChange={this._dateChange} value={this.state.date.getHours()}  step="6" />
			            		</div>
			            	</div>
			            </div>
		            </div>
                </div>
	            <div className='row'>
	            	<div className='col-xs-12' style={{border: '1px solid red'}}>
	            		 {this.state.projection}
	            		<Globe canvasData={this.state.canvasData} projection={this.state.projection} scale={this.state.scale} />
	            	</div>
	            </div>
	        </div>

		);
	}

});

// -----------------------------BRUSH CODE--------------------------------------
// <div className='row'>
// 	<div className='col-xs-3' />
// 	<div className='col-xs-6'>
//     	<Brush
//            width={this.state.elemWidth}
//            height={75}
//            margin={{top: 0, bottom: 30, left: 50, right: 20}}
//            xScale={xScaleBrush}
//            onChange={this._onChange}
//            extent={[this.state.date, secondDate]}
//            xAxis={{tickValues: xScaleBrush.ticks(d3.time.year, 5), tickFormat: d3.time.format("%y")}}
//		/>
//     	</div>
// </div>

module.exports = MapPage;
