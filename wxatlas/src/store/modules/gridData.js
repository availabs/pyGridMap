import { scales, variables } from './variableConfig'
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

// ------------------------------------
// Actions
// ------------------------------------
export function receiveGridData(res) {
  return {
    type: LOAD_DATA,
    res
  }
}

export function receiveConstant(key, val) {
  return {
    type: CHANGE_CONSTANT,
    key,
    val
  }
}

export function changeBounds(index, val) {
  return {
    type: CHANGE_BOUNDS,
    index,
    val
  }
}

export function setLocation(coords, scalarValue) {
  return {
    type: SET_LOCATION,
    coords,
    scalarValue
  }
}

export function changeScale(scaleName) {
  return {
    type: CHANGE_SCALE,
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
  [LOAD_DATA]: (state, action) => {
    var newState = Object.assign({}, state)
    if (action.res.type === 'error') {
      newState.error = action.res.text
    } else if (action.res.id !== -1) {
      newState.canvasData = action.res

      var variable = newState.variable
      var level = newState.height
      var type = newState.type
      var colors = scales[variables[variable].level[level][type].defaultScale]
      var min = variables[variable].level[level][type].min
      var max = variables[variable].level[level][type].max
      var step = variables[variable].level[level][type].step
      var bounds = Array((max - min) / step).fill().map((d, i) => i)

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
  [CHANGE_CONSTANT]: (state, action) => {
    var newState = Object.assign({}, state)
    newState[action.key] = action.val
    var level = newState.height
    var type = newState.type
    if (action.key === 'variable') {
      newState.colors = variables[action.val].level[level][type].defaultScale
    }
    return newState
  },
  [CHANGE_BOUNDS]: (state, action) => {
    var newState = Object.assign({}, state)
    var newBounds = newState.bounds.map(d => d)
    newBounds[action.index] = +action.val
    newState.bounds = newBounds
    return newState
  },
  [SET_LOCATION]: (state, action) => {
    var newState = Object.assign({}, state)
    newState.coordinates = action.coords
    newState.scalarValue = action.scalarValue
    return newState
  },
  [CHANGE_SCALE]: (state, action) => {
    var newState = Object.assign({}, state)

    newState.colors = action.scaleName
    var variable = newState.variable
    var level = newState.height
    var type = newState.type
    var colorArray = scales[action.scaleName]
    var bounds = newState.bounds

    newState.currentScale = chroma.bezier(colorArray)
      .scale()
      .colors(bounds.length)

    return newState
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export default function counterReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
