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
    var colors = this.props.currentScale
    if (typeof colors[0] === 'string') colors = colors.map(d => hexToRgb(d))
    var boundsBoxes = this.props.bounds.map((d, i) => {
      // var background = 'linear-gradient( to right, ' + this.color2rgb(colors[i-1] || colors[i] ) + ', ' + this.color2rgb(colors[i])+')'
      var background = this.color2rgb(colors[i])
      return (
          <div style={{ flex: 1, height: 25, display: 'inline', background: background, border: '2px solid black' }}>
            <span className='DisplayBounds' style={{ position: 'relative', left: -27, top: -25, fontSize: 13, fontWeight: 'bold', textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}>
              {this.props.bounds[i]}
            </span>
          </div>
      )
    })

    return (
      <div className='DisplayLegend' style={{ zIndex: 20, display: 'flex', position: 'fixed', top: 20, left: 40, right: 40, border: '2px solid black' }}>
        {boundsBoxes}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  bounds: state.gridData.bounds,
  activeScale: state.gridData.colors,
  scales: state.gridData.scales,
  currentScale: state.gridData.currentScale
})

export default connect(mapStateToProps, {})(DisplayLegend)
