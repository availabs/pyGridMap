var React = require("react"),
	d3 = require('d3'),
	d3Tip = require('d3-tip'),
    globe = require('./globe');

var RmmDemo = React.createClass({

	getInitialState:function(){
		return {
			width:0,
			height:0
		}
	},

	componentDidMount:function(){
		var scope = this;
		globe.init('#globeDiv',{projection:'orthoginal'})
        if(this.props.canvasData){
            globe.drawCanvas(this.props.canvasData);
        }
	},

    componentWillReceiveProps:function(nextProps){
    	globe.drawCanvas(nextProps.canvasData);
        // if(!this.props.canvasData && nextProps.canvasData){
        //     globe.drawCanvas(nextProps.canvasData);
        // }
        // else if(this.props.canvasData && nextProps.canvasData && this.props.date !== nextProps.date){
        //     console.log('redrawing canvas')
            
        // }
    },

	render:function(){
        var container = this.props.container || "globeDiv"
		return (
			<div id={container} style={{width:'100%',height:'600px'}} >
            </div>
		);
	}

});

module.exports = RmmDemo;
