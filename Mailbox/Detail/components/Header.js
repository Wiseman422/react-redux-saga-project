import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Link from 'react-router/lib/Link'
import FALock from 'react-icons/lib/fa/lock'
import Avatar from 'react-avatar'
import FlagIcon from 'react-flag-kit/lib/FlagIcon'
import IconTooltip from 'app/Components/IconTooltip'

import m from 'commons/I18n/'
import { getZoneTimeForUTC } from 'commons/Lib/Utils'

const formatTimestamp = (timestamp, timezone, intl) => {
  const localTime = getZoneTimeForUTC(timestamp, timezone)
  return `${intl.formatDate(localTime)}, ${intl.formatTime(localTime)}`
}

class MailboxDetailHeader extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    isGTMdScreen: PropTypes.bool,
    intl: PropTypes.object,
    indexName: PropTypes.string.isRequired,
    avatarImage: PropTypes.string,
    location: PropTypes.object,
    contact: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      fromUrl: '/contact'
    }
    this._updateFromUrl = this._updateFromUrl.bind(this)
  }

  _updateFromUrl (nextProps) {
    const { contact } = nextProps
    const { msg_from: msgFrom, msg_to: msgTo } = nextProps.data
    const inverted = nextProps.data.direction === 1
    if (contact) {
      this.setState({ fromUrl: `/contact/${inverted ? msgTo : msgFrom}` })
    } else {
      this.setState({ fromUrl: `/contact/new?email=${inverted ? msgTo : msgFrom}` })
    }
  }

  componentWillMount () {
    this._updateFromUrl(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this._updateFromUrl(nextProps)
  }

  render () {
    const props = this.props
    const { data } = props
    const isEncrypted = data.is_pgp_out || data.is_pgp_in || data.is_smime_out || data.is_smime_in
    let encryptionMessage
    if (
      ((data.is_pgp_out && data.is_smime_out) || (data.is_pgp_in && data.is_smime_in))
    ) {
      encryptionMessage = m.app.Mailbox.gpgSmimeEncrypted
    } else if (data.is_pgp_out || data.is_pgp_in) {
      encryptionMessage = m.app.Mailbox.gpgEncrypted
    } else if (data.is_smime_out || data.is_smime_in) {
      encryptionMessage = m.app.Mailbox.smimeEncrypted
    }

    let contactUrl
    let identityUrl
    if (data.direction === 1) {
      contactUrl = `/identity/${props.data.identity_id}`
      identityUrl = this.state.fromUrl
    } else {
      contactUrl = this.state.fromUrl
      identityUrl = `/identity/${props.data.identity_id}`
    }

    return (
      <div className='mailbox-detail__header'>
        <div className='mailbox-detail__header__top-info'>
          <div className='mailbox-detail__header__top-info__timestamp'>
            {formatTimestamp(props.data.created_on, props.timezone, props.intl)}
          </div>
          { props.data.inbound_region && (
            <FlagIcon className='mailbox-detail__header__top-info__country' code={props.data.inbound_region} />
          )}
          { isEncrypted && (
            <span className='mailbox-detail__header__top-info__lock'><IconTooltip placement='left' icon={FALock} trans={encryptionMessage} transValues={{smime: 'S/MIME', gpg: 'GPG'}} /></span>
          )}
          <div className='clearfix' />
        </div>

        <div className='mailbox-detail__header__main-info'>
          <div className='mailbox-detail__header__main-info__avatar' />
          <Avatar
            className='mailbox-detail__header__main-info__avatar'
            round
            size={50}
            src={props.avatarImage}
            name={props.data.msg_from_displayname || props.data.msg_from}
          />
          <div className='mailbox-detail__header__main-info__content'>
            <div className='mailbox-detail__header__main-info__content__from'>
              {props.data.msg_from_displayname || props.data.msg_from}
            </div>
            <div className='mailbox-detail__header__main-info__content__subject'>
              {props.data.msg_subject}
            </div>
          </div>
        </div>

        <div className='mailbox-detail__header__email-addresses'>
          <div className='mailbox-detail__header__email-addresses__content'>
            <div className='mailbox-detail__header__email-addresses__content__item'>
              <span className='mailbox-detail__header__email-addresses__content__key'>From:</span>
              <Link
                className='mailbox-detail__header__email-addresses__content__value'
                to={contactUrl}
              >
                {props.data.msg_from} >
              </Link>
            </div>
            <div className='mailbox-detail__header__email-addresses__content__item'>
              <span className='mailbox-detail__header__email-addresses__content__key'>To:</span>
              <Link
                className='mailbox-detail__header__email-addresses__content__value'
                to={identityUrl}
              >
                {props.data.msg_to} >
              </Link>
            </div>
          </div>
        </div>

        <div className='clearfix' />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  location: state.router.location
})

export default connect(mapStateToProps, null)(MailboxDetailHeader)
