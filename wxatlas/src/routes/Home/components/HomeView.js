import { initialLoad } from 'store/modules/gridData'
import React from 'react'
import Globe from 'components/globe/globe.react'
import moment from 'moment'
import d3 from 'd3'
import Sidebar from './Sidebar'
import { connect } from 'react-redux'
var referenceScale = d3.scale.linear()
     .domain([492, 522, (600 + 492) / 2, 570, 600])
     .range(['#053061', '#4393c3', '#f7f7f7', '#f4a582', '#67001f'])

import './HomeView.scss'

class MapPage extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      elemWidth: 800,
      screenHeight: 600
    }
  }

  componentWillMount () {
    this.setState({ screenHeight: window.innerHeight })
  }

  componentDidMount () {
    let newDate = this.state.date
    this.props.initialLoad()
    // this.loadData(this.state.type, this.state.variable, this.state.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours())
  }

  render () {
    const { date, format, mode, inputFormat } = this.state

    console.log('data', this.props.canvasData)

    return (

      <div className='map-content'>
        <Sidebar />
        <Globe
          canvasData={this.props.canvasData}
          projection={this.props.projection}
          scale={this.props.scale}
          height={this.state.screenHeight}
          leftOffset={20}
        />

      </div>

    )
  }

}

const mapStateToProps = (state) => {
  return {
    loading: state.gridData.loading,
    canvasData: state.gridData.canvasData,
    projection: state.gridData.projection,
    scale: state.gridData.scale
  }
}
export default connect(mapStateToProps, { initialLoad })(MapPage)
