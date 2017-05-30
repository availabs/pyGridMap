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

// -------------------------------------
// Initial State
// -------------------------------------
// var referenceScale = d3.scale.linear()
//      .domain([492, 522, (600 + 492) / 2, 570, 600])
//      .range(['#053061', '#4393c3', '#f7f7f7', '#f4a582', '#67001f'])

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
  bounds: []
}

var newDate = initialState.date
console.log('running', requestData)

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

export const setBounds = (index, val) => {
  return (dispatch) => {
    return dispatch(changeBounds(index, val))
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
    console.log('load_data attempt', action.res)

    if (action.res.type === 'error') {
      newState.error = action.res.text
    } else if (action.res.id !== -1) {
      action.res
      newState.canvasData = action.res
      var min = d3.min(newState.canvasData.data)
      var max = d3.max(newState.canvasData.data)
      var bounds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      var delta = (max - min) / bounds.length
      bounds = bounds.map((d, i) => {
        return Math.round(min + (i * delta))
      })
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
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
