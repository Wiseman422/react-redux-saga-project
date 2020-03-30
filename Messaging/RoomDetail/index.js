import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape, injectIntl } from 'react-intl'
import classnames from 'classnames'
import FAClose from 'react-icons/lib/fa/close'
import moment from 'moment'

import m from 'commons/I18n'
import { uuidv1ToDate } from 'commons/Lib/Utils'
import { getContactMember } from 'commons/Selectors/Messaging'

class RoomDetail extends PureComponent {

  static propTypes = {
    data: PropTypes.object,
    intl: intlShape,
    roomDetailOpen: PropTypes.bool,
    toggleRoomDetail: PropTypes.func.isRequired,
    identity: PropTypes.object,
    contact: PropTypes.object,
    timezone: PropTypes.string
  }

  constructor (props) {
    super(props)
    this._getMomentTime = this._getMomentTime.bind(this)
  }

  _renderMembers () {
    const { intl, data, identity, contact } = this.props
    const fm = intl.formatMessage
    const contactMember = getContactMember(data)
    const isContactOnline = Boolean(contactMember.public_key)
    const members = [
      {
        email: identity.email,
        display_name: identity.display_name,
        is_online: true
      },
      {
        email: contact.email,
        display_name: contact.display_name,
        is_online: isContactOnline
      }
    ].filter(member => member.email)
    return (
      <div className='msging__room-detail__section'>
        <div className='msging__room-detail__section-title'>
          {`${members.length} ${fm(m.app.Chat.members)}`}
        </div>
        <div className='msging__room-detail__section-body'>
          {members.map((member, index) => {
            if (!member.email) return null
            const memberClass = {
              'msging__room-detail__member-status': true,
              'msging__room-detail__member-status__online': member.is_online,
              'msging__room-detail__member-status__offline': !member.is_online
            }
            return (
              <div className='msging__room-detail__member' key={index}>
                {member.display_name || member.email}
                <div className={classnames(memberClass)} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  _getMomentTime (dateTime) {
    const { timezone } = this.props
    if (!dateTime) return ''
    let momentTime = null
    if (timezone) {
      momentTime = moment.tz(dateTime, timezone)
    } else {
      const offset = (-1 * (new Date()).getTimezoneOffset())
      momentTime = moment(dateTime).utcOffset(offset)
    }
    return momentTime
  }

  render () {
    const { roomDetailOpen, intl, data, identity, contact } = this.props
    if (!data) return null
    const fm = intl.formatMessage
    const roomDetailClass = {
      'msging__room-detail': true,
      'msging__room-detail__open': roomDetailOpen
    }
    const created = this._getMomentTime(uuidv1ToDate(data.room_id))

    return (
      <div className={classnames(roomDetailClass)}>

        <div className='msging__room-detail__title'>
          {fm(m.app.Chat.aboutThisConversation)}
          <div
            className='msging__room-detail__close'
            onClick={this.props.toggleRoomDetail}
          >
            <FAClose />
          </div>
        </div>

        <div className='msging__room-detail__section'>
          <div className='msging__room-detail__section-title'>
            {fm(data.is_e2ee ? m.app.Chat.ephemeralChat : m.app.Chat.encryptedChat)}
          </div>
          <div className='msging__room-detail__section-body'>
            {fm(data.is_e2ee ? m.app.Chat.ephemeralChatVerbose : m.app.Chat.encryptedChatVerbose)}
          </div>
        </div>

        <div className='msging__room-detail__section msging__room-detail__section-summary'>
          <div className='msging__room-detail__section-body'>
            {`${fm(m.app.Chat.youAre)} ${identity.display_name || identity.email}`}
            {identity.display_name ? ` <${identity.email}>.` : '.'} <br />
            {
              data.owner_identity_email === identity.email &&
              `${fm(m.app.Chat.chatStarted)} ${fm(m.app.Chat.you)} ${fm(m.app.Chat.on)} ${created.format('MMMM D, YYYY')}`
            }
            {
              data.owner_identity_email === contact.email &&
              `${fm(m.app.Chat.chatStarted)} ${contact.display_name || contact.email} ${fm(m.app.Chat.on)} ${created.format('MMMM D, YYYY')}`
            }
          </div>
        </div>

        {this._renderMembers()}

      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  timezone: state.user.data.timezone
})

const ConnectedRoomDetail = connect(mapStateToProps)(RoomDetail)

const InjectedRoomDetail = injectIntl(ConnectedRoomDetail)

export default InjectedRoomDetail
