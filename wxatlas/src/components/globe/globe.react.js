import { globeClick } from 'store/modules/gridData'
import { connect } from 'react-redux'

var React = require('react'),
  d3 = require('d3'),
  globe = require('./globe')

var GlobeDemo = React.createClass({

  getInitialState: function () {
    return {
      width:0,
      height:0
    }
  },

  componentDidMount: function () {
    var scope = this
    this.initGlobe(this.props)
    console.log('props', this.props)
  },

  initGlobe: function (props) {
    var container = props.container || 'globeDiv'
    if (props.leftOffset) {
      globe.leftOffset = props.leftOffset
    }
    globe.init('#' + container, { projection: props.projection, onGlobeClick: this.props.globeClick })
    if (this.props.scale) {
      console.log('setting this scale', this.props.scale)
      globe.setScale(this.props.scale)
    }
    if (props.canvasData) {
      console.log('initGlobe', props)
      globe.drawCanvas(props.canvasData, { bounds: this.props.bounds, colors: this.props.colors })
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.projection !== nextProps.projection) {
      var container = this.props.container || 'globeDiv'
      d3.selectAll('#' + container + ' .display').remove()
      this.initGlobe(nextProps)
    }
    var current_date = this.props.canvasData ? this.props.canvasData.header.date : null
    var next_date = nextProps.canvasData ? nextProps.canvasData.header.date : null
    console.log('colors in globe react', nextProps.colors)
    if (nextProps.canvasData) {
      globe.drawCanvas(nextProps.canvasData, { bounds: nextProps.bounds, colors: nextProps.colors })
    }
  },

  render: function () {
    var container = this.props.container || 'globeDiv'
    return (
      <div id={container} style={{ width: '100%', height: this.props.height || '600px' }} />
    )
  }

})

export default connect(null, { globeClick })(GlobeDemo)
