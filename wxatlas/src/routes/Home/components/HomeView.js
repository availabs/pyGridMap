import React from 'react'
import Globe from 'components/globe/globe.react'
import moment from 'moment'
import d3 from 'd3'
import Sidebar from './Sidebar'
var refernceScale = d3.scale.linear()
     .domain([492, 522, (600 + 492) / 2, 570, 600])
     .range(['#053061', '#4393c3', '#f7f7f7', '#f4a582', '#67001f'])

import './HomeView.scss'

var MapPage = React.createClass({

  getInitialState: function () {
    return {
      elemWidth: 800,
      screenHeight: 600,
      loading: false,
      canvasData: null,
      projection: 'orthographic',
      date: new Date(2010, 11, 31, 0),
      format: 'YYYY-MM-DD',
      inputFormat: 'MM-DD-YYYY',
      mode: 'date',
      variable: 'gph',
      height: 500,
      type: 'grids',
      activeTab: 'mapControls',
      scale:
        d3.scale.threshold()
            .domain(d3.range(492, 601, 6))
            .range(d3.range(492, 601, 6).map(function (d) { return refernceScale(d) }))
    }
  },

  componentWillMount: function () {
    this.setState({ screenHeight: window.innerHeight })
  },

  componentDidMount: function () {
    let newDate = this.state.date
    this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours())
  },

  loadData: function (type, variable, height, year, month, day, hour) {
    var scope = this
    this.setState({ loading: true })
    console.log('http://db-wxatlas.rit.albany.edu/' + type + '/' + variable + '/' + height + '/' + year + '/' + month + '/' + day + '/' + hour)
    d3.json('http://db-wxatlas.rit.albany.edu/' + type + '/' + variable + '/' + height + '/' + year + '/' + month + '/' + day + '/' + hour, (err, data) => {
      var funscale = d3.scale.linear().domain([
        d3.min(data.data),
        d3.max(data.data)
      ]).range([-100, 100])

      data.data = data.data.map(function (d) {
        return d / 10
      })

      data.header.date = new Date(year, month, day, hour)

      scope.setState({
        canvasData: data,
        scale: this.state.scale,
          // d3.scale.quantile()
          // .domain(data.data)
          // .range(['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'].reverse()),
        loading: false
      })
    })
  },

  render: function () {
    const { date, format, mode, inputFormat } = this.state

    return (

      <div className='map-content'>
        <Sidebar />
        <Globe
          canvasData={this.state.canvasData}
          projection={this.state.projection}
          scale={this.state.scale}
          height={this.state.screenHeight}
          leftOffset={20}
        />

      </div>

    )
  }

})

module.exports = MapPage
