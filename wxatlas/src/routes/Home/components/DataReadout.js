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

  componentWillReceiveProps (nextProps) {
    console.log("data readout new props", nextProps)
  }

  render () {
    console.log("render data readout", this.props)
    var locationClass = this.state.open ? 'location' : 'location closed'
    return (
      <div className={locationClass}>
        <div style={{ display: this.state.open ? 'block' : 'none' }}>
          <i className='fa fa-map-marker' />
          <div className='show-coordinates'>{this.props.coordinates}</div>
          <hr />
          <div className='show-grid-value'>{this.props.scalarValue}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  coordinates: state.coordinates,
  scalarValue: state.scalarValue
})

export default connect(mapStateToProps, {})(DataReadout)
