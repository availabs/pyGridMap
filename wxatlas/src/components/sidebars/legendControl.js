import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'
import { setBounds } from 'store/modules/gridData'
import { throttle } from 'components/utils/utils'
import NumberEditor from './numberEditor'

class LegendControls extends React.Component {
  constructor (props) {
    super(props)
    this._boundsChange = this._boundsChange.bind(this)
  }

  _boundsChange (val, name) {
    console.log('_boundsChange', val, name)
    throttle(this.props.setBounds(name,val), 300)
  }

  render () {
    var sidebarClass = this.props.open ? 'sidebar-container' : 'sidebar-container closed'
    var boundsBoxes = this.props.bounds.map((b,i) => {
      return (
        <li key={i}>
          <div className='row no-margin'>
            <div className='col-xs-12'>
              <NumberEditor
                min={this.props.bounds[i - 1] || 0} max={this.props.bounds[i + 1] || this.props.bounds[i] + 300}
                step={1}
                className='legendInput'
                decimals={0}
                name={i}
                value={this.props.bounds[i]}
                onValueChange={this._boundsChange}
              />       
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
