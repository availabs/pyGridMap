// var users = {
//   alex: 'am1238wk',
//   shane: 'orlando',
//   avail: 'password'
// }

const HOST = 'https://aauth.availabs.org/'

// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_DATA = 'LOAD_DATA'

// ------------------------------------
// Actions
// ------------------------------------
export function receiveGridData (res) {
  return {
    type : LOAD_DATA,
    res
  }
}



export const requestData = (date, variable) => {
  console.log('test 123', JSON.stringify({ email, password }))
  return (dispatch) => {
    return fetch(`${HOST}login/auth`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(json => {
      console.log('json', json)
      return dispatch(receiveGridData(json.message || json))
    })
  }
}

export const actions = {
  requestData
}

// -------------------------------------
// Initial State
// -------------------------------------
const initialState = {}

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
      newState = action.res
    }
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
