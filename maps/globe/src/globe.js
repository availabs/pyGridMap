import d3 from d3
// import topojson from topojson

exports default globe {
	init: (container){
		let display = d3.select(container)
			  	.append('div')
			  	.attr('class', 'display')

		display
			.append('svg')
			.attr('id', 'map')
			.attr('class', 'fill-screen')
		
		display
			.append('canvas')
			.attr('id', 'animation')
			.attr('class', 'fill-screen')

		display
			.append('canvas')
			.attr('id', 'overlay')
			.attr('class', 'fill-screen')

		display
			.append('svg')
			.attr('id', 'foreground')
			.attr('class', 'fill-screen')

		<canvas id="animation" class="fill-screen"></canvas>
		<canvas id="overlay" class="fill-screen"></canvas>
		<svg id="foreground" class="fill-screen" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>

	}
}