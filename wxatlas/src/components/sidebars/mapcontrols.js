import React from 'react'
import './mapcontrols.scss'
import { connect } from 'react-redux'
import { requestData, receiveConstant } from 'store/modules/gridData'

class Mapcontrols extends React.Component {
  constructor (props) {
    super(props)
    this.props = {
      open: true,
      projection: 'orthographic',
      date: new Date(2010, 11, 31, 0),
      format: 'YYYY-MM-DD',
      inputFormat: 'MM-DD-YYYY',
      mode: 'date',
      variable: 'gph',
      height: 500,
      type: 'grids'
    }
    this._dateChange = this._dateChange.bind(this)
    this._heightChange = this._heightChange.bind(this)
    this._variableChange = this._variableChange.bind(this)
    this._typeChange = this._typeChange.bind(this)
    this._projectionChange = this._projectionChange.bind(this)
  }

  _dateChange (e) {
    let newDate = this.props.date
    switch (e.target.name) {
      case 'year':
        newDate.setFullYear(e.target.value)
        this.props.requestData(this.props.type, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
        this.props.receiveConstant('date', newDate)
        console.log('date', this.props.date)
        break
      case 'month':
        newDate.setMonth(e.target.value - 1)
        this.props.requestData(this.props.type, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
        this.props.receiveConstant('date', newDate)
        break
      case 'day':
        newDate.setDate(e.target.value)
        this.props.requestData(this.props.type, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
        this.props.receiveConstant('date', newDate)
        break
      case 'hour':
        if (e.target.value === 24) {
          newDate.setHours(0)
          newDate = moment(newDate).add(1, 'days')._d
        } else if (e.target.value === -6) {
          newDate.setHours(18)
          newDate = moment(newDate).subtract(1, 'days')._d
        } else {
          newDate.setHours(e.target.value)
        }
        this.props.requestData(this.props.type, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
        this.props.receiveConstant('date', newDate)
        break
    }
  }

  _heightChange (e) {
    let newDate = this.props.date
    this.props.receiveConstant('height', e.target.value)
    this.props.requestData(this.props.type, this.props.variable, e.target.value, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
  }

  _variableChange (e) {
    let newDate = this.props.date
    // this.props.receiveConstant({ variable: e.target.value })
    this.props.receiveConstant('variable', e.target.value)
    this.props.requestData(this.props.type, e.target.value, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
  }

  _typeChange (e) {
    let newDate = this.props.date
    this.props.receiveConstant('type', e.target.value)
    this.props.requestData(e.target.value, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
  }

  _projectionChange (e) {
    let newDate = this.props.date
    this.props.receiveConstant('projection', e.target.value)
    this.props.requestData(this.props.type, this.props.variable, this.props.height, newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), this.props.date.getHours())
  }

  render () {
    var sidebarClass = this.props.open ? 'sidebar-container' : 'sidebar-container closed'
    console.log('gridData', this.props.gridData)
    return (
      <ul className='nav flex-column controls'>
        <li>
          <span>PROJECTION</span>
          <select onChange={this._projectionChange} name='projection' className='form-control' value={this.props.projection}>
            <option value='orthographic'>Orthographic</option>
            <option value='equirectangular'>Equirectangular</option>
            <option value='winkel3'>Winkel III</option>
          </select>
        </li>
        <li>
          <span>VARIABLE</span>
          <select onChange={this._variableChange} name='height' className='form-control' value={this.props.variable}>
            <option value='gph'>Geopotential Height</option>
            <option value='uwnd'>Zonal Wind</option>
            <option value='vwnd'>Meridional Wind</option>
          </select>
        </li>
        <li>
          <span>LEVEL</span>
          <select onChange={this._heightChange} name='height' className='form-control' value={this.props.height}>
            <option value='1000'>1000 hPa</option>
            <option value='925'>925 hPa</option>
            <option value='850'>850 hPa</option>
            <option value='700'>700 hPa</option>
            <option value='500'>500 hPa</option>
            <option value='300'>300 hPa</option>
            <option value='250'>250 hPa</option>
            <option value='200'>200 hPa</option>
            <option value='100'>100 hPa</option>
            <option value='50'>50 hPa</option>
            <option value='10'>10 hPa</option>
          </select>
        </li>
        <li>
          <span>TYPE</span>
          <select onChange={this._typeChange} name='height' className='form-control' value={this.props.type}>
            <option value='grids'>Total</option>
            <option value='anoms'>Anomaly</option>
          </select>
        </li>
        <li>
          <div className='row no-margin'>
            <div className='col-xs-3 year'>
              <span>YEAR</span>
              <input className='form-control' min='1979' max='2010' type='number' name='year' onChange={this._dateChange} value={this.props.date.getFullYear()} />
            </div>
            <div className='col-xs-3 month'>
              <span>MONTH</span>
              <input className='form-control' min='0' max='13' type='number' name='month' onChange={this._dateChange} value={this.props.date.getMonth() + 1} />
            </div>
            <div className='col-xs-3 day'>
              <span>DAY</span>
              <input className='form-control' min='0' max='32' type='number' name='day' onChange={this._dateChange} value={this.props.date.getDate()} />
            </div>
            <div className='col-xs-3 hour'>
              <span>HOUR</span>
              <input className='form-control' min='-6' max='24' type='number' name='hour' onChange={this._dateChange} value={this.props.date.getHours()} step='6' />
            </div>
          </div>
        </li>
      </ul>
    )
  }
}

const mapStateToProps = (state) => ({
  gridData: state.gridData,
  projection: state.gridData.projection,
  date: state.gridData.date,
  format: state.gridData.format,
  inputFormat: state.gridData.inputFormat,
  mode: state.gridData.mode,
  variable: state.gridData.variable,
  height: state.gridData.height,
  type: state.gridData.type
})

export default connect(mapStateToProps, { requestData, receiveConstant })(Mapcontrols)
