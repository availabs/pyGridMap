/*
TODO
Logo?
Find way to not collapse sidebar completely
Side bar beautification and functionality
Color scheme review
*/

var React = require("react");

var Header = React.createClass({

	render:function() {
		return (
			<header className="header">
				<a href="#">
					<div className="col-xs-2 hidden-xs header-logo">
						<span className="nav-label" style={{letterSpacing: "6px", color: "#ffffff", fontSize: "22px", fontWeight: "300"}}>
							<span style={{fontWeight: "900"}}>Wx</span>
							Atlas
							<sup style={{letterSpacing: "normal", fontSize: "11px", color: "#c9e6f2"}}>
								v.0.1
							</sup>
						</span>
					</div>
				</a>
			</header>
		);
	}

});

module.exports = Header;
