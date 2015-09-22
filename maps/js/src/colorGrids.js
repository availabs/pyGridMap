
var colorGrids = (function(){

	return {
		draw:function(grids,path){
			
			d3.json('data/console.json',function(err,data) {
			//console.log('new data', grids.data(data.features).enter().append("path"));
				
				console.log('data size', grids.selectAll(".colorGrids")
					.data(data.features)
					.enter().size())
				grids.selectAll(".colorGrids")
					.data(data.features)
					.enter()
					.append("path")

					.attr("class", "colorGrid")
					.attr("opacity", 0.5)
					.attr("stroke-opacity", 0.5)
					.attr("stroke-width",0.5)
					.attr("stroke",function(d){
						return d.properties.color;
					})
					.attr("fill",function(d){
						return d.properties.color;
					})
					.on('mouseover',function(){
						var elem = d3.select(this);
						//console.log('mouseover',elem)
						
						elem.attr('stroke-width',5)
							.attr('stroke','#f00')					
					})
					.on('mouseout',function(){
						var elem = d3.select(this)
						elem
							.attr('stroke-width',0.5)
							.attr("stroke",function(d){
								return d.properties.color;
							})
					})
					.on('click',function(){
						console.log(this)
					})
					;


				
				 d3.selectAll("path").attr("d", path)

			})
		}
	}
})()