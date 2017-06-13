import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'


class DisplayLegend extends React.Component {
  constructor (props) {
    super(props)
  }

  color2rgb (color) {
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
  }
  render () {
    var boundsBoxes = this.props.bounds.map((b,i) => {
      var background = 'linear-gradient( to right, ' + this.color2rgb(this.props.colors[i-1] || this.props.colors[i] ) + ', ' + this.color2rgb(this.props.colors[i])+')'
      return (
          <div style={{  flex: 1, height: 20, overflow: 'hidden', display: 'inline', background: background }}>
            {this.props.bounds[i]}
          </div>
      )
    })

    return (
      <div className='DisplayLegend' style={{ display: 'flex', position: 'fixed', top: 15, left: 15, right: 15}}>
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
