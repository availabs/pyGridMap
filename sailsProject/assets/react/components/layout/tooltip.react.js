var React = require('react');

var ToolTip = React.createClass({

	render: function() {

		//<i style={closeStyle} className="fa fa-close pull-right" onClick={this._Close}></i>
		return (
			<div id="nytg-tooltip">
                <div id="nytg-tooltipContainer">
                    <div className="nytg-department"></div>
                    <div className="nytg-rule"></div>
                    <div className="nytg-name"></div>
                    <div className="nytg-discretion"></div>
                    <div className="nytg-valuesContainer">
                        <span className="nytg-value"></span>
                        <span className="nytg-change"></span>
                    </div>
                    <div className="nytg-chart"></div>
                    <div className="nytg-tail"></div>
                </div>
            </div>
		);
	}
});

module.exports = ToolTip;
