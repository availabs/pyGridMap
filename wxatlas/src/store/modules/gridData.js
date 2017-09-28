// var users = {
//   alex: 'am1238wk',
//   shane: 'orlando',
//   avail: 'password'
// }
import d3 from 'd3'

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
  divergent_1: ['#053061', '#2b3d7e', '#454e91', '#5c61a2', '#7276b1', '#878bbf', '#9ba1cd', '#afb7da', '#c3cfe6', '#d6e6f2', '#ffffff', '#ffffff', '#f9d388', '#efba79', '#e3a26b', '#d7895d', '#c87250', '#b95943', '#a84338', '#962a2e', '#811225', '#67001f'],
  rainbow: ['#5a005a', '#960096', '#c800c8', '#7d00e1', '#3200e1', '#0064c8', '#00c8f0', '#00ffaa', '#00e100', '#96e100', '#e1e100', '#ffff00', '#ffc800', '#ff8700', '#ff3200', '#c80000'],
  rdbu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
  moisture: ["#001107", "#00240e", "#053916", "#0e4f1f", "#1b652a", "#2d7b38", "#429148", "#5ba75d", "#7cbd79", "#a0d39a", "#c7e9c0", "#ffffff", "#ffffff", "#fdd0a2", "#e9b686", "#d69d6c", "#c38555", "#b06f41", "#9d5a30", "#8a4720", "#773614", "#64260a", "#511a03", "#310f01"],
  anomaly: ["#9e6cae", "#5e3785", "#25135c", "#000033", "#000099", "#0000e5", "#4c4cff", "#6666ff", "#ccccff", "#ffffff", "#ffffff", "#ffeda0", "#fd8d3c", "#fc4e2a", "#bd0026", "#990000", "#4c0000", "#78152d", "#a53965", "#d26eb9"]
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
  colors: "moisture",
  scales: scales,
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

export const setColorScale = (scaleName) => {
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
  console.log(`${HOST}${type}/${variable}/${height}/${year}/${month}/${day}/${hour}`)
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
    // console.log('load_data attempt', action.res)

    if (action.res.type === 'error') {
      newState.error = action.res.text
    } else if (action.res.id !== -1) {
      action.res
      newState.canvasData = action.res
      // var min = d3.min(newState.canvasData.data)
      // var max = d3.max(newState.canvasData.data)
      var min = 4320
      var max = 6000
      var delta = 60
      var bounds = state.scales[state.colors].map(d => 0)
      console.log('bounds', bounds)
      // var delta = (max - min) / bounds.length
      console.log('delta', delta)
      bounds = bounds.map((d, i) => {
        return Math.round(min + (i * delta))
      })
      console.log('bounds', bounds)
      newState.bounds = bounds
    }
    return newState
  },
  [CHANGE_CONSTANT] : (state, action) => {
    var newState = Object.assign({}, state)
    newState[action.key] = action.val
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
    console.log('set_location', action, newState)
    return newState
  },
  [CHANGE_SCALE] : (state, action) => {
    var newState = Object.assign({}, state)
    newState.colors = action.scaleName
    var min = d3.min(newState.canvasData.data)
    var max = d3.max(newState.canvasData.data)
    var bounds = state.scales[newState.colors].map(d => 0)
    var delta = (max - min) / bounds.length
    bounds = bounds.map((d, i) => {
      return Math.round(min + (i * delta))
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
