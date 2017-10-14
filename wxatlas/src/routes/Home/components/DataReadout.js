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
          <div>
            <div className='fa fa-map-marker'></div>
            <div className='show-coordinates'>{this.props.coordinates}</div>
          </div>
          <hr style={{ borderTopColor: '#fff' }}/>
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
