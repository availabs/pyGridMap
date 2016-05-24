var React = require("react"),
	d3 = require('d3'),
	d3Tip = require('d3-tip'),
    globe = require('./globe');

var GlobeDemo = React.createClass({

	getInitialState: function(){
		return {
			width:0,
			height:0
		}
	},

	componentDidMount: function(){
		var scope = this;
		this.initGlobe(this.props)
		
	},

	initGlobe: function (props){
		var container = props.container || "globeDiv"
		globe.init('#'+container, {projection: props.projection})
	    if(props.canvasData){
	        globe.drawCanvas(props.canvasData);
	    }
	},

    componentWillReceiveProps: function(nextProps){
    	globe.drawCanvas(nextProps.canvasData);
    	if(this.props.projection !== nextProps.projection){
    		var container = this.props.container || "globeDiv"
    		//console.log('new projection', '#'+container+' .display', d3.selectAll('#'+this.props.container+' .display'))
    		d3.selectAll('#' + container + ' .display').remove()
    		this.initGlobe(nextProps)
    	}
        // if(!this.props.canvasData && nextProps.canvasData){
        //     globe.drawCanvas(nextProps.canvasData);
        // }
        // else if(this.props.canvasData && nextProps.canvasData && this.props.date !== nextProps.date){
        //     console.log('redrawing canvas')

        // }
    },

	render: function(){
        var container = this.props.container || "globeDiv"
		return (
			<div id={container} style={{width:'100%', height:'600px'}}>
            </div>
		);
	}

});

module.exports = GlobeDemo;
