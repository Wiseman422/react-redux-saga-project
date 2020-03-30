import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class SwitchTabs extends Component {

  static propTypes = {
    isE2ee: PropTypes.bool,
    handleSwitchToRegular: PropTypes.func.isRequired,
    handleSwitchToEphemeral: PropTypes.func.isRequired
  }

  render () {
    const regularClass = classnames({
      'msging__switchTab': true,
      'msging__switchTab__regular': true,
      'msging__switchTab__active': !this.props.isE2ee
    })
    const ephemeralClass = classnames({
      'msging__switchTab': true,
      'msging__switchTab__ephemeral': true,
      'msging__switchTab__active': this.props.isE2ee
    })
    return (
      <div className='msging__switchTabs'>
        <div className={regularClass} onClick={this.props.handleSwitchToRegular}>Encrypted</div>
        <div className={ephemeralClass} onClick={this.props.handleSwitchToEphemeral}>Ephemeral</div>
      </div>
    )
  }
}

export default SwitchTabs
