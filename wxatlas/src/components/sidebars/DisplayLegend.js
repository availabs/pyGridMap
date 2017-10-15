import React from 'react'
import './mapcontrols.scss'
import './DisplayLegend.scss'
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
    var boundsLabels = this.props.bounds.map((d, i) => {
      if (this.props.variable === 'temp' && this.props.type === 'grids') {
        var labels = this.props.bounds[i] - 273
      } else {
        var labels = this.props.bounds[i]
      }
      return (
        <div className='label-test'>
          { labels }
        </div>
      )
    })
    var boundsBoxes = this.props.bounds.map((d, i) => {
      var background = this.color2rgb(colors[i])
      return (
        <div style={{ flex: 1, height: 25, display: 'inline', background: background, border: '2px solid black' }}>
        </div>
      )
    })

    // Add the extra boundary label to the end of the color legend
    var step = this.props.bounds[1] - this.props.bounds[0]
    if (this.props.variable === 'temp' && this.props.type === 'grids') {
      var lastLabel = (this.props.bounds[this.props.bounds.length - 1] - 273) + step
    } else {
      var lastLabel = this.props.bounds[this.props.bounds.length - 1] + step
    }
    boundsLabels.push(
      (
        <div className='label-test'>
          { lastLabel }
        </div>
      )
    )

    return (
      <div>
        <div className='legend-labels'>
          { boundsLabels }
        </div>
        <div className='color-legend'>
          { boundsBoxes }
        </div>
      </div>
    )

  }
}

const mapStateToProps = (state) => ({
  type: state.gridData.type,
  variable: state.gridData.variable,
  bounds: state.gridData.bounds,
  activeScale: state.gridData.colors,
  scales: state.gridData.scales,
  currentScale: state.gridData.currentScale
})

export default connect(mapStateToProps, {})(DisplayLegend)
