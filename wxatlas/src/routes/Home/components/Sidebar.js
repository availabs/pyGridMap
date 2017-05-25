import React from 'react'
import Mapcontrols from 'components/sidebars/mapcontrols'
import './Sidebar.scss'

const tabs = [
  {
    name: 'Home',
    icon: 'fa fa-home'
  },
  {
    name: 'Map',
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
    this.setActiveTab = this.setActiveTab.bind(this)
    this.renderContent = this.renderContent.bind(this)
  }

  setActiveTab (tab) {
    this.setState({ activeTab: tab })
  }

  toggleSidebar () {
    this.setState({ open: !this.state.open })
  }

  renderButtons () {
    var displayTabs = tabs.map((tab, i) => {
      return (
        <li key={i} onClick={this.setActiveTab.bind(null, tab)} className={this.state.activeTab.name === tab.name ? 'active' : ''}>
          <a id='menu-group-risk-spotlight-tab' href='#menu-group-risk-spotlight' data-toggle='tab' data-index='0' aria-expanded='true'>
            <i className={tab.icon} />
          </a>
        </li>
      )
    })
    return (
      <ul className='nav flex-column open-tabs'>
        <li className='layer-toggle' onClick={this.toggleSidebar}>
          <span className='glyphicon glyphicon-chevron-right' />
        </li>
        {displayTabs}
      </ul>
    )
  }

  renderContent () {
    switch (this.state.activeTab.name) {
      case 'Home':
        return <Mapcontrols />
      default:
        return <div>{this.state.activeTab.name}</div>
    }
  }

  render () {
    var sidebarClass = this.state.open ? 'sidebar-container' : 'sidebar-container closed'
    return (
      <div className={sidebarClass}>
        {this.renderButtons()}
        <div style={{ overflow: 'hidden', display: this.state.open ? 'block' : 'none' }}>
          {this.renderContent()}
        </div>
      </div>
    )
  }
}

export default Sidebar
