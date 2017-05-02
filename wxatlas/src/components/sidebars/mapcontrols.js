import React from 'react'
import './mapcontrols.scss'

class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
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
  }

  render () {
    var sidebarClass = this.state.open ? 'sidebar-container' : 'sidebar-container closed'
    return (
      <ul className='nav flex-column controls'>
        <li>
          <span>PROJECTION</span>
          <select onChange={this._projectionChange} name='projection' className='form-control' value={this.state.projection}>
            <option value='orthographic'>Orthographic</option>
            <option value='equirectangular'>Equirectangular</option>
            <option value='winkel3'>Winkel III</option>
          </select>
        </li>
        <li>
          <span>VARIABLE</span>
          <select onChange={this._variableChange} name='height' className='form-control' value={this.state.variable}>
            <option value='gph'>Geopotential Height</option>
            <option value='uwnd'>Zonal Wind</option>
            <option value='vwnd'>Meridional Wind</option>
          </select>
        </li>
        <li>
          <span>LEVEL</span>
          <select onChange={this._heightChange} name='height' className='form-control' value={this.state.height}>
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
          <select onChange={this._typeChange} name='height' className='form-control' value={this.state.type}>
            <option value='grids'>Total</option>
            <option value='anoms'>Anomaly</option>
          </select>
        </li>
        <li>
          <div className='row no-margin'>
            <div className='col-xs-3 year'>
              <span>YEAR</span>
              <input className='form-control' min='1979' max='2010' type='number' name='year' onChange={this._dateChange} value={this.state.date.getFullYear()} />
            </div>
            <div className='col-xs-3 month'>
              <span>MONTH</span>
              <input className='form-control' min='0' max='13' type='number' name='month' onChange={this._dateChange} value={this.state.date.getMonth() + 1} />
            </div>
            <div className='col-xs-3 day'>
              <span>DAY</span>
              <input className='form-control' min='0' max='32' type='number' name='day' onChange={this._dateChange} value={this.state.date.getDate()} />
            </div>
            <div className='col-xs-3 hour'>
              <span>HOUR</span>
              <input className='form-control' min='-6' max='24' type='number' name='hour' onChange={this._dateChange} value={this.state.date.getHours()} step='6' />
            </div>
          </div>
        </li>
      </ul>
    )
  }
}

export default Sidebar
