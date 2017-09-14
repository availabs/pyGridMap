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
  },

  initGlobe: function (props) {
    var container = props.container || 'globeDiv'
    if (props.leftOffset) {
      globe.leftOffset = props.leftOffset
    }
    globe.init('#' + container, { projection: props.projection })
    if (this.props.scale) {
      globe.setScale(this.props.scale)
    }
    if (props.canvasData) {
      console.log('initGlobe', props)
      globe.drawCanvas(props.canvasData, {bounds: this.props.bounds, colors: this.props.colors})
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
    if (nextProps.canvasData) {
      globe.drawCanvas(nextProps.canvasData, {bounds: nextProps.bounds, colors: nextProps.colors})
    }

    // if (nextProps.scale) {
    //   globe.setScale(nextProps.scale)
    // }
  },

  render: function () {
    var container = this.props.container || 'globeDiv'
    return (
      <div id={container} style={{ width: '100%', height: this.props.height || '600px' }} />
    )
  }

})

module.exports = GlobeDemo
