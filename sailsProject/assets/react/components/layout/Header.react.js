var React = require("react");

var Header = React.createClass({
	
	render:function() {
		return (
			<nav className="navbar" id="topNav" style={{borderBottom:'1px solid lightblue'}}>
				<div className="container">
					<div className="navbar-header">
						<a className="navbar-brand" href="#"> Demo </a>
					</div>
					<div>
						<ul className="nav navbar-nav">
							<li><a href="#">Home</a></li>
							<li><a href="/#/map">Map</a></li>
						</ul>
					</div>
				</div>
			</nav>
		);
	}

});

module.exports = Header;
