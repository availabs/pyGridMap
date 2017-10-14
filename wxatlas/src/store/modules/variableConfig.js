// ------------------------------------
// Color scales
// ------------------------------------
/* Current scale descriptions

   Sequential
   - rainbow

   Divergent
   - RdBu (Blue to red with white in the center)

*/
const scales = {
  moisture: ['#001107', '#429148', '#ffffff', '#b06f41', '#310f01'],
  rainbow: ['#5a005a', '#7d00e1', '#00ffaa', '#ffff00', '#c80000'],
  RdBu: ['#053061', '#878bbf', '#ffffff', '#c87250', '#67001f'],
  RdYlBu: ['#0904fb', '#33c1f9', '#ffffff', '#ffc20c', '#ce0000']
  // qualitative: [
  //   '#235877', '#356782', '#44758d', '#538598', '#6293a2', '#71a3ae', '#80b3b9',
  //   '#8ec3c4', '#9dd5d0', '#ace5db', '#b3ece0', '#b2e1dd', '#b0d8db', '#aecdd8',
  //   '#acc3d5', '#aab8d3', '#a8aed0', '#a5a5cd', '#a29bcb', '#9f90c8', '#9c86c5',
  //   '#997cc2', '#9671bf', '#9268bc', '#8e5db9', '#8a52b6', '#8647b3', '#813bb0',
  //   '#7d2dad', '#781eaa', '#a037af', '#a74eb6', '#ae62bc', '#b575c3', '#bb87c9',
  //   '#c199cf', '#c7abd5', '#cbbedc', '#d0cfe2', '#d4e2e8', '#deecf2', '#ccd9ec',
  //   '#bac6e5', '#a8b4de', '#95a2d7', '#8291d1', '#6e80ca', '#586fc2', '#3e60bb',
  //   '#1450b4', '#0f4455', '#31565e', '#4a6767', '#627970', '#7a8c7a', '#91a082',
  //   '#a9b38c', '#c2c895', '#dadc9e', '#f3f2a7', '#f8eea2', '#ead48f', '#dbbc7c',
  //   '#cca36a', '#bd8a59', '#ae7347', '#9e5b37', '#8e4427', '#7d2c19', '#6c0d09',
  //   '#640000', '#6c0d14', '#751822', '#7d2331', '#852c40', '#73372d', '#81493d',
  //   '#8f594e', '#9c6b60', '#aa7d72', '#b79085', '#c4a397', '#d1b6ab', '#dec9bf',
  //   '#ebddd3', '#f2e6dc', '#ddd2ca', '#c9bfb8', '#b5ada7', '#a19b95', '#8e8985',
  //   '#7b7775', '#696665', '#585655', '#464646'
  // ],
}

// ------------------------------------
// Variable default settings
// ------------------------------------
const variables = {
  gph: {
    level: {
      1000: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: -300, max: 300, step: 30 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -250, max: 250, step: 25 }
      },
      925: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 400, max: 1000, step: 30 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -250, max: 250, step: 25 }
      },
      850: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 1000, max: 1600, step: 30 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -250, max: 250, step: 25 }
      },
      700: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 2590, max: 3220, step: 30 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -300, max: 300, step: 25 }
      },
      500: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 4920, max: 6000, step: 60 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -400, max: 400, step: 50 }
      },
      300: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 8380, max: 9940, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -500, max: 500, step: 50 }
      },
      250: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 9360, max: 11160, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -500, max: 500, step: 50 }
      },
      200: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 10760, max: 12680, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -500, max: 500, step: 50 }
      },
      100: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 15080, max: 16880, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -500, max: 500, step: 50 }
      },
      50: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 19040, max: 20960, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -600, max: 600, step: 75 }
      },
      10: {
        grids: { defaultScale: 'rainbow', validScales: ['rainbow', 'RdYlBu'], min: 29000, max: 31520, step: 120 },
        anoms: { defaultScale: 'RdBu', validScales: ['rainbow', 'RdYlBu'], min: -600, max: 600, step: 75 }
      }
    }
  },
  uwnd: {
    level: {
      1000: {
        grids: { defaultScale: 'RdYlBu', min: -20, max: 20, step: 2 },
        anoms: { defaultScale: 'RdBu', min: -20, max: 20, step: 2 }
      },
      925: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      850: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      700: {
        grids: { defaultScale: 'RdYlBu', min: -40, max: 40, step: 4 },
        anoms: { defaultScale: 'RdBu', min: -40, max: 40, step: 4 }
      },
      500: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      300: {
        grids: { defaultScale: 'RdYlBu', min: -100, max: 100, step: 10 },
        anoms: { defaultScale: 'RdBu', min: -60, max: 60, step: 6 }
      },
      250: {
        grids: { defaultScale: 'RdYlBu', min: -100, max: 100, step: 10 },
        anoms: { defaultScale: 'RdBu', min: -60, max: 60, step: 6 }
      },
      200: {
        grids: { defaultScale: 'RdYlBu', min: -100, max: 100, step: 10 },
        anoms: { defaultScale: 'RdBu', min: -60, max: 60, step: 6 }
      },
      100: {
        grids: { defaultScale: 'RdYlBu', min: -60, max: 60, step: 6 },
        anoms: { defaultScale: 'RdBu', min: -60, max: 60, step: 6 }
      },
      50: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      10: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      }
    }
  },
  vwnd: {
    level: {
      1000: {
        grids: { defaultScale: 'RdYlBu', min: -20, max: 20, step: 2 },
        anoms: { defaultScale: 'RdBu', min: -20, max: 20, step: 2 }
      },
      925: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      850: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      700: {
        grids: { defaultScale: 'RdYlBu', min: -40, max: 40, step: 4 },
        anoms: { defaultScale: 'RdBu', min: -40, max: 40, step: 4 }
      },
      500: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      300: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      250: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      200: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      },
      100: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      50: {
        grids: { defaultScale: 'RdYlBu', min: -30, max: 30, step: 3 },
        anoms: { defaultScale: 'RdBu', min: -30, max: 30, step: 3 }
      },
      10: {
        grids: { defaultScale: 'RdYlBu', min: -50, max: 50, step: 5 },
        anoms: { defaultScale: 'RdBu', min: -50, max: 50, step: 5 }
      }
    }
  },
  t2m: {
    scale: 'moisture',
    min: 260,
    max: 335,
    step: 5
  }
}

export { scales, variables }
