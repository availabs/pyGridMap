/*
Generates a horizontal grid on which to map data.
*/
function generateGrid(){

    var xDeg = 2.5, // x-grid horizontal resolution
        yDeg = 2.5, // y-grid horizontal resolution
        maxX = 360, // max longitude
        minY = -90; // min latitude

    var features = [], // mapping features
        c = {x: 0, y: 90}, // starting coordinates
        tLx, tLy, // top-left lon,lat
        tRx, tRy, // top-right lon,lat
        bRx, bRy, // bottom-right lon,lat
        bLx, bLy; // bottom-left lon,lat

    // Build coordinate array, from top-left to bottom-right
    var count = 0;
    for(var iY = 90; iY > minY; iY -= yDeg){

        for(var iX = 0; iX < maxX; iX += xDeg){

            tLx = bLx = c.x; // set top-left/bottom-left lon to c.x
            tLy = tRy = c.y; // set top-left/bottom-left lat to c.y
            tRx = bRx = c.x + xDeg; // add xDeg to build x-grid
            bRy = bLy = c.y - yDeg; // add yDeg to build y-grid

            var cell = [
                [tLx, tLy], // top-left
                [tRx, tRy], // top-right
                [bRx, bRy], // bottom-right
                [bLx, bLy], // bottom-left
                [tLx, tLy] // top-left
            ];

            var featCell = {
                type:'Feature',
                properties:{
                    count:count,
                    lng:tLx,
                    lat:tLy
                },
                geometry:{
                    type:'Polygon',
                    coordinates:[cell]
                }
            }

            features.push(featCell);

            // refresh cursor for x
            c.x = c.x + xDeg;
            count++;
        }

        // refresh cursor for y
        c.x = 0;
        c.y = c.y - yDeg;
    }

    return {
        type: 'FeatureCollection',
        features: features
    };
}
