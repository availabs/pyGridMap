import React from 'react'
import MapControls from 'components/sidebars/MapControls'
import LegendControls from 'components/sidebars/LegendControls'
import './Sidebar.scss'

const tabs = [
  {
    name: 'Home',
    icon: 'fa fa-home'
  },
  {
    name: 'Legend',
    icon: 'fa fa-globe'
  },
  {
    name: 'Dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'API',
    icon: 'fa fa-cogs'
  },
  {
    name: 'About',
    icon: 'fa fa-info-circle'
  }
]

class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: true,
      activeTab: tabs[0]
    }
    this.toggleSidebar = this.toggleSidebar.bind(this)
    this.openSidebar = this.openSidebar.bind(this)
    this.setActiveTab = this.setActiveTab.bind(this)
    this.renderContent = this.renderContent.bind(this)
  }

  toggleSidebar () {
    this.setState({ open: !this.state.open })
  }

  openSidebar () {
    this.setState({ open: !this.state.open ? true : this.state.open, activeTab: this.state.activeTab })
  }

  setActiveTab (tab) {
    this.setState({ activeTab: tab, open: !this.state.open ? true : this.state.open })
  }

  renderButtons () {
    var displayTabs = tabs.map((tab, i) => {
      return (
        <li key={i} onClick={this.setActiveTab.bind(null, tab)} className={this.state.activeTab.name === tab.name ? 'active' : ''}>
          <a href='#'>
            <span className={tab.icon} />
          </a>
        </li>
      )
    })
    return (
      <ul className='nav flex-column open-tabs'>
        <li className='layer-toggle' onClick={this.toggleSidebar}>
          <a href='#'>
            <span className={this.state.open ? 'fa fa-chevron-left' : 'fa fa-chevron-right'} />
          </a>
        </li>
        {displayTabs}
      </ul>
    )
  }

  renderContent () {
    switch (this.state.activeTab.name) {
      case 'Home':
        return <MapControls />
      case 'Legend':
        return <LegendControls />
      default:
        return <div>{this.state.activeTab.name}</div>
    }
  }

  render () {
    var sidebarClass = this.state.open ? 'sidebar-container' : 'sidebar-container closed'
    var controlsClass = this.state.open ? 'controls' : 'controls-closed'
    return (
      <div className={sidebarClass}>
        {this.renderButtons()}
        <div className={controlsClass}>
          {this.renderContent()}
        </div>
      </div>
    )
  }
}

export default Sidebar
