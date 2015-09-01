
function generateGrid(){

  var xDeg= 2.5//cells by x
  var yDeg = 2.5;//cells by x
  var maxX = 180,
      maxY = 180;

  var features = [],
      c = {x: -180, y: -180},//cursor
      //top-left/top-right/bottom-right/bottom-left
      tLx, tLy,   tRx, tRy,
      bRx, bRy,   bLx, bLy;

  // build coordinates array, from top-left to bottom-right
  //count by row
  var count = 0;
  for(var iY = -180; iY < maxY; iY+=yDeg){
    //count by cell in row
    for(var iX = -180; iX < maxX; iX+=xDeg){
      tLx = bLx = c.x;
      tLy = tRy = c.y;
      tRx = bRx =c.x + xDeg;
      bRy = bLy = c.y - yDeg;
      var cell = [
        //top-left/top-right/bottom-right/bottom-left/top-left
        [tLx, tLy], [tRx, tRy], [bRx, bRy], [bLx, bLy], [tLx, tLy]
      ];
      //console.log(cell[0],cell[1],cell[2],cell[3],cell[4])
      var featCell = {
        type:'Feature',
        properties:{count:count},
        geometry:{
          type:'Polygon',
          coordinates:[cell]
        }
      }
      features.push(featCell);
      //refresh cusror for cell
      c.x = c.x + xDeg;
      count++;
    }
    //refresh cursor for row
    c.x = -180;
    c.y = c.y + yDeg;
  }

  return {
    type: 'FeatureCollection',
    features: features
  };
}
//add grid to map
