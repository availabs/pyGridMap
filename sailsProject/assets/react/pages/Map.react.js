var React = require('react'),
	Globe = require('../components/globe/globe.react'),
	Brush = require('react-d3-components').Brush,
	moment = require('moment'),
	d3 = require('d3'),
	Legend = require('../components/tools/legend.react'),
	refernceScale = d3.scale.linear()
	   .domain([492, 522, (600+492)/2, 570, 600])
	   .range(["#053061","#4393c3","#f7f7f7","#f4a582","#67001f"]);

var MapPage = React.createClass({

	getInitialState: function() {

		return {
			elemWidth: 800,
			screenHeight: 600,
			loading: false,
			canvasData: null,
			projection: "orthographic",
			date: new Date(2010, 11, 31, 0),
			format: "YYYY-MM-DD",
			inputFormat: "MM-DD-YYYY",
			mode: "date",
			variable: "gph",
			height: 500,
			type: "grids",
			activeTab: "mapControls",
			scale:
				d3.scale.threshold()
		        .domain(d3.range(492, 601, 6))
		        .range(d3.range(492,601,6).map(function(d){ return refernceScale(d)}))
		        	// ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"])
		}

	},

	componentWillMount: function() {

		this.setState({screenHeight: window.innerHeight});

	},

	componentDidMount: function () {

		let newDate = this.state.date;
		this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), newDate.getHours());

	},

	loadData: function(type, variable, height, year, month, day, hour) {

		var scope = this;
		this.setState({loading: true})
		console.log('http://db-wxatlas.rit.albany.edu/'+type+'/'+variable+'/'+height+'/'+year+'/'+month+'/'+day+'/'+hour)
		d3.json('http://db-wxatlas.rit.albany.edu/'+type+'/'+variable+'/'+height+'/'+year+'/'+month+'/'+day+'/'+hour, (err,data) =>{
			var funscale = d3.scale.linear().domain([
					d3.min(data.data),
					d3.max(data.data)
				]).range([-100, 100])

			data.data = data.data.map(function(d) {
				return d/10;
			})

			data.header.date = new Date(year, month, day, hour)

			scope.setState({
				canvasData: data,
				scale: this.state.scale,
					//d3.scale.quantile()
					//.domain(data.data)
					//.range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"].reverse()),
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
		this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), hour)
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
    			this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
				console.log('date', this.state.date)
    		break;
    		case 'month':
				newDate.setMonth(e.target.value-1)
    			this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    		case 'day':
				newDate.setDate(e.target.value)
    			this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
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
    			this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())
    			this.setState({date: newDate})
    		break;
    	}

    },

    _heightChange(e) {

    	let newDate = this.state.date
    	this.setState({height: e.target.value})
    	this.loadData(this.state.type, this.state.variable, e.target.value, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())

    },

	_variableChange(e) {

    	let newDate = this.state.date
    	this.setState({variable: e.target.value})
    	this.loadData(this.state.type, e.target.value, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())

    },

	_typeChange(e) {

    	let newDate = this.state.date
    	this.setState({type: e.target.value})
    	this.loadData(e.target.value, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())

    },

	_projectionChange(e) {

		let newDate = this.state.date
		this.setState({projection: e.target.value})
		this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate(), this.state.date.getHours())

	},

	_setActiveTab(tab) {
		this.setState({
			activeTab: tab
		})
	},

	_showActiveTab(tab) {
		return this.state.activeTab === tab ? "block" : "none"
	},

	_isTabActive(tab) {
		return this.state.activeTab === tab ? "active" : "inactive"
	},

	render: function() {

		const {date, format, mode, inputFormat} = this.state;

		return (

			<div className="container-fluid main">
    			<div className="row nav-container">
    				<div className="col-xs-2 hidden-xs side-nav">
						<a className="title-logo" href="#">
							<div className="header">
								<span className="navbar-brand title">
									<span className="emphasize">Wx</span>
									Atlas
									<sup className="version">
										v.0.1
									</sup>
								</span>
							</div>
						</a>
    					<nav>
    						<ul className="nav">
    							<li className={this._isTabActive("mapControls")} onClick={this._setActiveTab.bind(null, "mapControls")}>
									<a href="#">
										<span className="glyphicon glyphicon-cog">
										</span>
										<span className="nav-label">
											Map Settings
										</span>
									</a>
									<ul className="nav sub-nav nav-stacked controls" style={{display: this._showActiveTab("mapControls")}}>
										<li>
											<span>PROJECTION</span>
											<select onChange={this._projectionChange} name="projection" className="form-control" value={this.state.projection}>
												<option value="orthographic">Orthographic</option>
												<option value="equirectangular">Equirectangular</option>
												<option value="winkel3">Winkel III</option>
											</select>
										</li>
										<li>
											<span>VARIABLE</span>
											<select onChange={this._variableChange} name="height" className="form-control" value={this.state.variable}>
												<option value="gph">Geopotential Height</option>
												<option value="uwnd">Zonal Wind</option>
												<option value="vwnd">Meridional Wind</option>
											</select>
										</li>
										<li>
											<span>LEVEL</span>
											<select onChange={this._heightChange} name="height" className="form-control" value={this.state.height}>
												<option value="1000">1000 hPa</option>
												<option value="925">925 hPa</option>
												<option value="850">850 hPa</option>
												<option value="700">700 hPa</option>
												<option value="500">500 hPa</option>
												<option value="300">300 hPa</option>
												<option value="250">250 hPa</option>
												<option value="200">200 hPa</option>
												<option value="100">100 hPa</option>
												<option value="50">50 hPa</option>
												<option value="10">10 hPa</option>
											</select>
										</li>
										<li>
											<span>TYPE</span>
											<select onChange={this._typeChange} name="height" className="form-control" value={this.state.type}>
												<option value="grids">Total</option>
												<option value="anoms">Anomaly</option>
											</select>
										</li>
										<li>
											<div className="col-sm-3 year">
												<span>YEAR</span>
												<input className="form-control" min="1979" max="2010" type="number" name="year" onChange={this._dateChange} value={this.state.date.getFullYear()} />
											</div>
											<div className="col-sm-3 month">
												<span>MONTH</span>
												<input className="form-control" min="0" max="13" type="number" name="month" onChange={this._dateChange} value={this.state.date.getMonth()+1} />
											</div>
											<div className="col-sm-3 day">
												<span>DAY</span>
												<input className="form-control" min="0" max="32" type="number" name="day" onChange={this._dateChange} value={this.state.date.getDate()} />
											</div>
											<div className="col-sm-3 hour">
												<span>HOUR</span>
												<input className="form-control" min="-6" max="24" type="number" name="hour" onChange={this._dateChange} value={this.state.date.getHours()}  step="6" />
											</div>
										</li>
									</ul>
								</li>
								<li className={this._isTabActive("home")} onClick={this._setActiveTab.bind(null, "home")}>
    								<a href="#">
                                        <span className="glyphicon glyphicon-home">
                                        </span>
                                        <span className="nav-label">
                                            Home
                                        </span>
                                    </a>
									<ul className="nav sub-nav nav-stacked sub-options" style={{display: this._showActiveTab("home")}}>
										<a href="#">
											<li>
												<span>Option 1</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 2</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 3</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 4</span>
											</li>
										</a>
									</ul>
								</li>
								<li className={this._isTabActive("globe")} onClick={this._setActiveTab.bind(null, "globe")}>
    								<a href="#">
                                        <span className="glyphicon glyphicon-globe">
                                        </span>
                                        <span className="nav-label">
                                            Globe
                                        </span>
                                    </a>
									<ul className="nav sub-nav nav-stacked sub-options" style={{display: this._showActiveTab("globe")}}>
										<a href="#">
											<li>
												<span>Option 1</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 2</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 3</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 4</span>
											</li>
										</a>
									</ul>
								</li>
								<li className={this._isTabActive("dashboard")} onClick={this._setActiveTab.bind(null, "dashboard")}>
									<a href="#">
										<span className="glyphicon glyphicon-dashboard">
										</span>
										<span className="nav-label">
											Dashboard
										</span>
									</a>
									<ul className="nav sub-nav nav-stacked sub-options" style={{display: this._showActiveTab("dashboard")}}>
										<a href="#">
											<li>
												<span>Option 1</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 2</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 3</span>
											</li>
										</a>
										<a href="#">
											<li>
												<span>Option 4</span>
											</li>
										</a>
									</ul>
    							</li>
    						</ul>
    					</nav>
    				</div>
    				<div className="col-sm-10 map-content">
						<div className="row">
	    					<Globe
								canvasData={this.state.canvasData}
								projection={this.state.projection}
								scale={this.state.scale}
								height={this.state.screenHeight}
								leftOffset={20}
							/>
						</div>
    				</div>
    	        </div>
	        </div>

		);
	}

});

// <div className="col-sm-3 overview">
// 	<div className="widget map-analytics">
// 		<span>Overview</span>
// 	</div>
// </div>

// -----------------------------BRUSH CODE--------------------------------------
// <div className="row">
// 	<div className="col-xs-3' />
// 	<div className="col-xs-6">
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
