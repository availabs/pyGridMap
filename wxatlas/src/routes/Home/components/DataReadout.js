import React from 'react'
import './DataReadout.scss'
import { connect } from 'react-redux'

class DataReadout extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: true
    }
    this.toggleReadout = this.toggleReadout.bind(this)
  }

  toggleReadout () {
    this.setState({ open: !this.state.open })
  }

  render () {
    var locationClass = this.state.open ? 'location' : 'location closed'
    return (
      <div className={locationClass}>
        <div style={{ display: this.state.open ? 'block' : 'none' }}>
          <i className='fa fa-map-marker' />
          <div className='show-coordinates' />
          <hr />
          <div className='show-grid-value' />
        </div>
      </div>
    )
  }
}

export default DataReadout
