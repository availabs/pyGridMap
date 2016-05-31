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
        var values = this.props.scale.quantiles ? this.props.scale.quantiles() : this.props.scale.domain()
        var scale = values.map(function(d,i){
            return (
                <div style={{backgroundColor: scope.props.scale(d), flex: 1, height: 20}}>
                </div>
            )
        })
        var scaleValues = values.map(function(d,i){
            return (
                <div style={{flex: 1, height: 20, textAlign: 'right'}}>
                    <span style={{position: 'relative', right: -20, fontSize: 12, fontWeight: 'bold'}}>
                        {i < values.length - 1 ? d.toLocaleString() : ''}
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
