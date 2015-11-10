var React = require("react"),
	moment = require('moment');
	
	
var DemoPage = React.createClass({
	getDefaultProps:function(){
        return {
            
            startDate:moment().subtract(120, 'days'),
            endDate: moment(),
            graphData:[]

        }

    },

   	filterDataByDate:function(data){
        var scope = this;

        return data.filter(function(d,i){
                
            var n = new Date(d.date),
                s = new Date(scope.props.startDate),
                e = new Date(scope.props.endDate);

            
            return d && n >= s  && n <= e;
        })

    },


	render:function(){
		

		
		var data = this.filterDataByDate(this.props.graphData)


		return (
	
			<div className="stuff">

	           {JSON.stringify(data)}
	        </div>	

		);
	}

});

module.exports = DemoPage;


