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
    var coordinates = this.props.coordinates
    if (this.props.variable === 'temp' && this.props.type === 'grids') {
      var dataValue = this.props.scalarValue-273
    } else {
      var dataValue = this.props.scalarValue
    }
    return (
      <div className={'location'}>
        <div style={{ display: this.state.open ? 'block' : 'none' }}>
          <div>
            <div className='fa fa-map-marker'></div>
            <div className='show-coordinates'>{coordinates}</div>
          </div>
          <hr style={{ borderTopColor: '#fff' }}/>
          <div className='show-grid-value'>{dataValue}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  type: state.gridData.type,
  variable: state.gridData.variable,
  coordinates: state.gridData.coordinates,
  scalarValue: state.gridData.scalarValue
})

export default connect(mapStateToProps, {})(DataReadout)
