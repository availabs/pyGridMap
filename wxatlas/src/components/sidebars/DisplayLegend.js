import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'

function hexToRgb (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

class DisplayLegend extends React.Component {
  constructor (props) {
    super(props)
  }

  color2rgb (color) {
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
  }

  render () {
    var colors = this.props.colors
    if (typeof colors[0] === 'string') colors = colors.map(d => hexToRgb(d))
    var boundsBoxes = this.props.bounds.map((b,i) => {
      var background = 'linear-gradient( to right, ' + this.color2rgb(colors[i-1] || colors[i] ) + ', ' + this.color2rgb(colors[i])+')'
      return (
          <div style={{  flex: 1, height: 20, overflow: 'hidden', display: 'inline', background: background }}>
            {this.props.bounds[i]}
          </div>
      )
    })

    return (
      <div className='DisplayLegend' style={{ zIndex: 20, display: 'flex', position: 'fixed', top: 15, left: 15, right: 15}}>
        {boundsBoxes}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  bounds: state.gridData.bounds,
  colors: state.gridData.colors
})

export default connect(mapStateToProps, {})(DisplayLegend)
