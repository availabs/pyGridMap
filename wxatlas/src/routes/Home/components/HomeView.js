import { initialLoad } from 'store/modules/gridData'
import React from 'react'
import Globe from 'components/globe/globe.react'
import DisplayLegend from 'components/sidebars/DisplayLegend'
import d3 from 'd3'
import Sidebar from './Sidebar'
import DataReadout from './DataReadout'
import { connect } from 'react-redux'
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
  }

  render () {
    const { date, format, mode, inputFormat } = this.state

    return (

      <div className='map-content'>
        <DisplayLegend />
        <Sidebar />
        <DataReadout />
        <Globe
          canvasData={this.props.canvasData}
          projection={this.props.projection}
          bounds={this.props.bounds}
          colors={this.props.currentScale}
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
    bounds: state.gridData.bounds,
    colors: state.gridData.colors,
    scales: state.gridData.scales,
    currentScale: state.gridData.currentScale
  }
}
export default connect(mapStateToProps, { initialLoad })(MapPage)
