import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Avatar from 'react-avatar'

class RoomHeader extends PureComponent {

  static propTypes = {
    data: PropTypes.object,
    toggleRoomDetail: PropTypes.func.isRequired,
    callContact: PropTypes.func.isRequired,
    emailContact: PropTypes.func.isRequired,
    exportContactVcard: PropTypes.func.isRequired,
    contact: PropTypes.object.isRequired,
    roomActions: PropTypes.array
  }

  constructor (props) {
    super(props)
    this._renderAvatar = this._renderAvatar.bind(this)
    this._renderName = this._renderName.bind(this)
    this._renderRoomActions = this._renderRoomActions.bind(this)
  }

  _renderAvatar () {
    const { contact } = this.props
    return (
      <div className='msging__room-header__avatar'>
        <Avatar
          name={contact.display_name || contact.email}
          round
          size={50}
          src={contact.avatar}
        />
      </div>
    )
  }

  _renderName () {
    const { contact } = this.props
    let displayName = contact.display_name
    let emailName, emailDomain
    if (contact.display_name && contact.display_name !== contact.email) {
      [emailName, emailDomain] = (contact.email || '@').split('@')
    } else {
      [displayName, emailDomain] = (contact.email || '@').split('@')
    }
    return (
      <div className='msging__room-header__contact-title'>
        {displayName && <div className='msging__room-header__display-name'>{displayName}</div>}
        {emailName && <div className='msging__room-header__email-name'>{emailName}</div>}
        {emailDomain && <div className='msging__room-header__email-domain'>@{emailDomain}</div>}
      </div>
    )
  }

  _renderRoomActions () {
    const actions = this.props.roomActions
    const noop = () => {}
    return actions.map((action, index) => (
      <div
        className='msging__room-header__action'
        onClick={action.onClick || noop}
        key={index}
      >
        <div className='msging__room-header__action__icon'>
          <action.icon />
        </div>
        <div className='msging__room-header__action__label'>
          {action.label}
        </div>
      </div>
    ))
  }

  render () {
    const { data } = this.props
    if (!data) return null
    return (
      <div className='msging__room-header'>
        <div className='msging__room-header__left'>
          {this._renderAvatar()}
          {this._renderName()}
        </div>
        <div className='msging__room-header__right'>
          {this._renderRoomActions()}
        </div>
      </div>
    )
  }
}

export default RoomHeader
