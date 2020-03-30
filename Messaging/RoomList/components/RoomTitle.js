import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import FACircle from 'react-icons/lib/fa/circle'
import FACircleEmpty from 'react-icons/lib/fa/circle-o'

import m from 'commons/I18n'
import { getRoomTitle, getContactMember } from 'commons/Selectors/Messaging'

class RoomTitle extends PureComponent {

  static propTypes = {
    intl: intlShape,
    data: PropTypes.object,
    className: PropTypes.string
  }

  constructor (props) {
    super(props)
    this._renderStatus = this._renderStatus.bind(this)
  }

  _renderStatus () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    const contactMember = getContactMember(data)
    const isContactOnline = Boolean(contactMember.public_key)
    if (isContactOnline) {
      return (
        <span
          className='msging__room-list__li__status msging__room-list__li__status__online'
          title={fm(m.app.Chat.statusOnline)}
        >
          <FACircle />
        </span>
      )
    }
    return (
      <span
        className='msging__room-list__li__status msging__room-list__li__status__offline'
        title={fm(m.app.Chat.statusOffline)}
      >
        <FACircleEmpty />
      </span>
    )
  }

  render () {
    const { data, className } = this.props
    const title = getRoomTitle(data, data.member_email)
    return (
      <div className={className} >
        {this._renderStatus()}
        {' '}
        {title}
      </div>
    )
  }
}

const InjectedRoomTitle = injectIntl(RoomTitle)

export default InjectedRoomTitle
