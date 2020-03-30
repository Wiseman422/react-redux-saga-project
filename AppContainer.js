import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Router from 'react-router/lib/Router'
import { Provider } from 'react-intl-redux'
import NotificationSystem from 'react-notification-system'

import { locationChange } from 'commons/Redux/RouterRedux'
import StartupActions from 'commons/Redux/StartupRedux'
import history from 'app/Routes/History'
import hashLinkScroll from 'app/Routes/hashLinkScroll'
import KeyboardActions from 'app/Redux/KeyboardRedux'

class AppContainer extends Component {

  constructor (props) {
    super(props)
    this._handleKeyUp = this._handleKeyUp.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  componentWillMount () {
    document.addEventListener('keyup', this._handleKeyUp)
    document.addEventListener('keydown', this._handleKeyDown)
    this.props.store.dispatch(StartupActions.startup())
  }

  componentWillUnmount () {
    document.removeEventListener('keyup', this._handleKeyUp)
    document.removeEventListener('keyDown', this._handleKeyDown)
  }

  _handleKeyUp (ev) {
    this.props.store.dispatch(KeyboardActions.appKeyUp(ev.keyCode))
  }

  _handleKeyDown (ev) {
    this.props.store.dispatch(KeyboardActions.appKeyDown(ev.keyCode))
  }

  _setNotificationSystemRef (ref) {
    window.notificationSystem = ref
  }

  render () {
    const { routes, store } = this.props

    return (
      <div style={{ height: '100%' }} id='top'>
        <NotificationSystem ref={this._setNotificationSystemRef} />
        <Provider store={store}>
          <Router history={history} children={routes} onUpdate={hashLinkScroll} />
        </Provider>
      </div>
    )
  }
}

AppContainer.propTypes = {
  routes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
}

export default AppContainer
