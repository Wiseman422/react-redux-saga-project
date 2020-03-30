import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { getWindowWidth } from 'commons/Lib/Utils'
import sessionStorage from 'commons/Services/SessionStorage'

const SidebarStateFromBool = {
  false: 'false',
  true: 'true'
}

const SidebarStateToBool = {
  'false': false,
  'true': true
}

class ResponsiveContainer extends Component {
  static propTypes = {
    isLargeScreen: PropTypes.bool,
    isMediumScreen: PropTypes.bool,
    identifier: PropTypes.string.isRequired,

    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),  // List view
    sidebarComponent: PropTypes.func
  }

  static defaultProps = {
    params: {},
    noneSelectedMessage: 'Please select an item',
  }

  constructor (props) {
    super(props)

    this.toggleSidebar = this.toggleSidebar.bind(this)

    // Check what the saved state is for sidebar
    const savedState = SidebarStateToBool[sessionStorage.getItem(this._getFullIdentifier())]
    // If there is no saved state, then show sidebar if width > 1200
    const sidebarOpen = typeof savedState !== 'undefined' ? savedState : getWindowWidth() >= 768

    this.state = {
      sidebarOpen: sidebarOpen
    }
  }

  toggleSidebar () {
    // Remember the chosen state in sessionStorage
    sessionStorage.setItem(
      this._getFullIdentifier(),
      SidebarStateFromBool[!this.state.sidebarOpen]
    )
    this.setState({ sidebarOpen: !this.state.sidebarOpen })
  }

  _getFullIdentifier () {
    return `${this.props.identifier}ResponsiveContainerSidebarOpen`
  }

  _renderSidebar () {
    if (this.props.isMediumScreen) {
      return (
        <div className='billing-container__sidebar'>
          <div className='billing-container__sidebar__inner'>
            <this.props.sidebarComponent />
          </div>
          <div className='billing-container__sidebar__toggle-area' onClick={this.toggleSidebar}>
            <span className='billing-container__sidebar__toggle-area__caret' />
          </div>
        </div>
      )
    }
  }

  render () {
    const { children } = this.props

    const classes = classNames({
      'billing-container': true,
      'billing-container--sidebar-visible': this.state.sidebarOpen
    })

    return (
      <div className={classes}>
        {this.props.isMediumScreen && this._renderSidebar()}
        <div className='billing-container__content-pane'>
          {children}
        </div>
      </div>
    )
  }
}

export default ResponsiveContainer
