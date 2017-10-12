import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'
import { setBounds, setColors } from 'store/modules/gridData'
import { throttle } from 'components/utils/utils'
import NumberEditor from './numberEditor'

class LegendControls extends React.Component {
  constructor (props) {
    super(props)
    this._boundsChange = this._boundsChange.bind(this)
    this._scaleChange = this._scaleChange.bind(this)
  }

  _boundsChange (val, name) {
    throttle(this.props.setBounds(name, val), 300)
  }

  _scaleChange (val, name) {
    this.props.setColors(val.target.value)
  }

  color2rgb (color) {
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
  }

  render () {
    // var colors = this.props.scales[this.props.activeScale]
    var scaleName = this.props.activeScale
    var colors = this.props.currentScale
    if (typeof colors[0] === 'string') colors = colors.map(d => hexToRgb(d))
    var sidebarClass = this.props.open ? 'sidebar-container' : 'sidebar-container closed'
    var boundsBoxes = this.props.bounds.map((b,i) => {
      // var background = 'linear-gradient( to bottom, ' + this.color2rgb(colors[i-1] || colors[i] ) + ', ' + this.color2rgb(colors[i])+')'
      var background = this.color2rgb(colors[i])
      //console.log("background", background)
      return (
        <li key={i}>
          <div className='row no-margin'>
            <div className='col-xs-12'>
              <NumberEditor
                min={this.props.bounds[i - 1] || 0} max={this.props.bounds[i + 1] || this.props.bounds[i] + 300}
                step={1}
                className='legendInput'
                style={{background: background, border: "none"}}
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
    var scaleList = Object.keys(this.props.scales).map(colorScale => {
      var colors = this.props.currentScale
      if (typeof colors[0] === 'string') colors = colors.map(d => hexToRgb(d))
      return (
        <option value={colorScale}>{colorScale.toUpperCase()}</option>
      )
    })

    return (
      <ul className='nav flex-column controls'>
        <li>
          <span>COLOR SCALE</span>
          <select onChange={this._scaleChange} name='scale' className='form-control' value={this.props.activeScale}>
            {scaleList}
          </select>
        </li>
        {boundsBoxes}
      </ul>
    )
  }
}

const mapStateToProps = (state) => ({
  bounds: state.gridData.bounds,
  scales: state.gridData.scales,
  activeScale: state.gridData.colors,
  currentScale: state.gridData.currentScale
})

export default connect(mapStateToProps, { setBounds, setColors })(LegendControls)

function hexToRgb (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}
