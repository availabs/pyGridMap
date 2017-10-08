import React from 'react'
import './DataReadout.scss'
import { connect } from 'react-redux'

class DataReadout extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: true
    }
  }

  render () {
    if (!this.props.coordinates) return <span />
    return (
      <div className={'location'}>
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
  coordinates: state.gridData.coordinates,
  scalarValue: state.gridData.scalarValue
})

export default connect(mapStateToProps, {})(DataReadout)
