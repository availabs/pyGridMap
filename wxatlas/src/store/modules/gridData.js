// var users = {
//   alex: 'am1238wk',
//   shane: 'orlando',
//   avail: 'password'
// }
import d3 from 'd3'
import chroma from 'chroma-js'

const HOST = 'http://db-wxatlas.rit.albany.edu/'

// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_DATA = 'LOAD_DATA'
export const CHANGE_CONSTANT = 'CHANGE_CONSTANT'
export const CHANGE_BOUNDS = 'CHANGE_BOUNDS'
export const SET_LOCATION = 'SET_LOCATION'
export const CHANGE_SCALE = 'CHANGE_SCALE'

// -------------------------------------
// Initial State
// -------------------------------------
/* Color scales:

   Sequential
   - rainbow

   Divergent
   - divergent_1 (Blue to red with white in the center)

*/
const scales = {
  moisture: ['#001107', '#429148', '#ffffff', '#b06f41', '#310f01'],
  rainbow: ['#5a005a', '#7d00e1', '#00ffaa', '#ffff00', '#c80000'],
  divergent_1: ['#053061', '#878bbf', '#ffffff', '#c87250', '#67001f']
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
  // divergent_1: [
  //   '#053061', '#2b3d7e', '#454e91', '#5c61a2', '#7276b1', '#878bbf', '#9ba1cd',
  //   '#afb7da', '#c3cfe6', '#d6e6f2', '#ffffff', '#f9d388', '#efba79',
  //   '#e3a26b', '#d7895d', '#c87250', '#b95943', '#a84338', '#962a2e', '#811225',
  //   '#67001f'
  // ],
  // rainbow: [
  //   '#5a005a', '#960096', '#c800c8', '#7d00e1', '#3200e1', '#0064c8', '#00c8f0',
  //   '#00ffaa', '#00e100', '#96e100', '#e1e100', '#ffff00', '#ffc800', '#ff8700',
  //   '#ff3200', '#c80000'
  // ],
  // rdbu: [
  //   '#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0',
  //   '#92c5de', '#4393c3', '#2166ac', '#053061'
  // ],
  // moisture: [
  //   "#001107", "#00240e", "#053916", "#0e4f1f", "#1b652a", "#2d7b38", "#429148",
  //   "#5ba75d", "#7cbd79", "#a0d39a", "#c7e9c0", "#ffffff", "#ffffff", "#fdd0a2",
  //   "#e9b686", "#d69d6c", "#c38555", "#b06f41", "#9d5a30", "#8a4720", "#773614",
  //   "#64260a", "#511a03", "#310f01"
  // ],
  // anomaly: [
  //   "#9e6cae", "#5e3785", "#25135c", "#000033", "#000099", "#0000e5", "#4c4cff",
  //   "#6666ff", "#ccccff", "#ffffff", "#ffeda0", "#fd8d3c", "#fc4e2a",
  //   "#bd0026", "#990000", "#4c0000", "#78152d", "#a53965", "#d26eb9"
  // ]
}
const variables = {
  gph: {scale: 'rainbow', min: 4920, max: 6000, step: 60},
  uwnd: {scale: 'divergent_1', min: -50, max: 50, step: 5},
  vwnd: {scale: 'divergent_1', min: -50, max: 50, step: 5},
  t2m: {scale: 'moisture', min: 260, max: 335, step: 5}
}
const initialState = {
  loading: false,
  canvasData: null,
  projection: 'orthographic',
  date: new Date(2010, 11, 31, 0),
  format: 'YYYY-MM-DD',
  inputFormat: 'MM-DD-YYYY',
  mode: 'date',
  variable: 'gph',
  height: 500,
  type: 'grids',
  bounds: [],
  colors: 'rainbow',
  scales: scales,
  currentScale: scales['rainbow'],
  coordinates: null,
  scalarValue: null
}

var newDate = initialState.date
// console.log('running', requestData)

// ------------------------------------
// Actions
// ------------------------------------
export function receiveGridData (res) {
  return {
    type : LOAD_DATA,
    res
  }
}

export function receiveConstant (key, val) {
  return {
    type : CHANGE_CONSTANT,
    key,
    val
  }
}

export function changeBounds (index, val) {
  return {
    type : CHANGE_BOUNDS,
    index,
    val
  }
}

export function setLocation (coords, scalarValue) {
  return {
    type : SET_LOCATION,
    coords,
    scalarValue
  }
}

export function changeScale (scaleName) {
  return {
    type : CHANGE_SCALE,
    scaleName
  }
}

export const setBounds = (index, val) => {
  return (dispatch) => {
    return dispatch(changeBounds(index, val))
  }
}

export const globeClick = (coords, scalarValue) => {
  return (dispatch) => {
    return dispatch(setLocation(coords, scalarValue))
  }
}

export const setColors = (scaleName) => {
  return (dispatch) => {
    return dispatch(changeScale(scaleName))
  }
}

export const setConstant = (key, val) => {
  return (dispatch) => {
    return dispatch(receiveConstant(key, val))
  }
}

export const initialLoad = () => {
  return (dispatch) => {
    return dispatch(requestData(initialState.type, initialState.variable, initialState.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours()))
  }
}

export const requestData = (type, variable, height, year, month, day, hour) => {
  console.log('request data', `${HOST}${type}/${variable}/${height}/${year}/${month}/${day}/${hour}`)
  return (dispatch) => {
    return fetch(`${HOST}${type}/${variable}/${height}/${year}/${month}/${day}/${hour}`)
    .then(response => response.json())
    .then(data => {
      data.header.date = new Date(year, month, day, hour)

      return dispatch(receiveGridData(data))
    })
  }
}

export const actions = {
  requestData,
  initialLoad,
  setBounds
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LOAD_DATA] : (state, action) => {
    var newState = Object.assign({}, state)
    if (action.res.type === 'error') {
      newState.error = action.res.text
    } else if (action.res.id !== -1) {
      newState.canvasData = action.res
      var colors = newState.scales[newState.colors]
      var min = variables[newState.variable].min
      var max = variables[newState.variable].max
      var step = variables[newState.variable].step
      var bounds = Array((max-min)/step).fill().map((d, i) => i)
      bounds = bounds.map((d, i) => {
        return Math.round(min + (i * step))
      })
      newState.currentScale = chroma.bezier(colors)
                                  .scale()
                                  .colors(bounds.length)
      newState.bounds = bounds
    }
    return newState
  },
  [CHANGE_CONSTANT] : (state, action) => {
    var newState = Object.assign({}, state)
    newState[action.key] = action.val
    if (action.key === 'variable') {
      newState.colors = variables[action.val].scale
    }
    return newState
  },
  [CHANGE_BOUNDS] : (state, action) => {
    var newState = Object.assign({}, state)
    var newBounds = newState.bounds.map(d => d)
    newBounds[action.index] = +action.val
    newState.bounds = newBounds
    return newState
  },
  [SET_LOCATION] : (state, action) => {
    var newState = Object.assign({}, state)
    newState.coordinates = action.coords
    newState.scalarValue = action.scalarValue
    return newState
  },
  [CHANGE_SCALE] : (state, action) => {
    var newState = Object.assign({}, state)
    newState.colors = action.scaleName
    var min = variables[newState.variable].min
    var max = variables[newState.variable].max
    var step = variables[newState.variable].step
    var bounds = Array((max-min)/step).fill().map((d, i) => i)
    bounds = bounds.map((d, i) => {
      return Math.round(min + (i * step))
    })
    newState.bounds = bounds
    return newState
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
