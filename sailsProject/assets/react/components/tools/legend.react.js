var React = require("react");

var Legend = React.createClass({

    getDefaultProps: function() {
        return {
            scale: d3.scale.quantile()
                    .domain([1,2,3,4,5])
                    .range(["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"])
        };
    },

	render: function() {
        var scope = this;
        console.log('quantiles?', this.props.scale, this.props.scale.quantiles);
        var values = this.props.scale.quantiles ? this.props.scale.quantiles() : this.props.scale.domain()
        var scale = values
        .filter(function(d,i) { return i < values.length -1})
        .map(function(d,i){
            return (
                <div style={{backgroundColor: scope.props.scale(d), flex: 1, height: 20, border: '1px solid white'}}>
                </div>
            )
        })
        var scaleValues = values
        .filter(function(d,i) { return i < values.length -1})
        .map(function(d,i){
            return (
                <div style={{flex: 1, height: 20, textAlign: 'left'}}>
                    <span style={{position: 'relative', right: 10, fontSize: 12, fontWeight: 'bold'}}>
                        { d.toLocaleString() }
                        {  i === values.length - 2 ? <span className='pull-right' style={{position:'relative', right:-20, top:2}}> {values[values.length-1]} </span>: ''}
                    </span>
                </div>
            )
        })

		return (
            <div>
    			<div style={{display: 'flex'}}>{scaleValues}</div>
                <div style={{display: 'flex'}}>{scale}</div>
            </div>
		);
	}

});

module.exports = Legend;
