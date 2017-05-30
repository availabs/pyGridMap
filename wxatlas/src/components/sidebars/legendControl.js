import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'
import { setBounds } from 'store/modules/gridData'

class LegendControls extends React.Component {
  constructor (props) {
    super(props)
    this._boundsChange = this._boundsChange.bind(this)
  }

  _boundsChange (e) {
    this.props.setBounds(e.target.name, e.target.value)
  }
  
  render () {
    var sidebarClass = this.props.open ? 'sidebar-container' : 'sidebar-container closed'
    var boundsBoxes = this.props.bounds.map((b,i) => {
      return (
        <li key={i}>
          <div className='row no-margin'>
            <div className='col-xs-12 year'>
              <input 
                className='form-control' 
                type='number' 
                name={i} 
                onChange={this._boundsChange} 
                value={this.props.bounds[i]} />
            </div>
          </div>
        </li>
      )
    })

    return (
      <ul className='nav flex-column controls'>
        {boundsBoxes}
      </ul>
    )
  }
}

const mapStateToProps = (state) => ({
  bounds: state.gridData.bounds
})

export default connect(mapStateToProps, {setBounds })(LegendControls)
