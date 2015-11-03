var React = require("react"),
	
	//--coponents
	RmmGraph = require('../components/graphs/RmmDemo.react');
	
	
var DemoPage = React.createClass({
	
	render:function(){
		
		return (
	
			<div className="container main">
	            <RmmGraph />
	        </div>

		);
	}

});

module.exports = DemoPage;


