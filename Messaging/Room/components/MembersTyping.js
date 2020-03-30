import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import classnames from 'classnames'
import FALock from 'react-icons/lib/fa/lock'
import FaExpeditedssl from 'react-icons/lib/fa/expeditedssl'

import m from 'commons/I18n'

class MembersTyping extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: intlShape
  }

  constructor (props) {
    super(props)
    this._getMembersTyping = this._getMembersTyping.bind(this)
    this._renderMessageString = this._renderMessageString.bind(this)
  }

  _getMembersTyping () {
    const { data } = this.props
    if (!data || !data.membersTyping) return []
    return Object.keys(data.membersTyping).filter(username => data.membersTyping[username])
  }

  _renderMessageString () {
    const { intl } = this.props
    const fm = intl.formatMessage
    const membersTyping = this._getMembersTyping()
    if (!membersTyping.length) return null
    return fm(m.app.Chat.typing, { members: membersTyping.join(', '), memberCount: membersTyping.length })
  }

  render () {
    const membersTyping = this._getMembersTyping()
    const hintClass = {
      'msging__room-hint': true,
      'msging__room-hint__open': membersTyping.length
    }
    return (
      <div className={classnames(hintClass)}>
        {this.props.data.is_e2ee ? <FaExpeditedssl /> : <FALock />}
        {' '}
        {this._renderMessageString()}
      </div>
    )
  }
}

const InjectedMembersTyping = injectIntl(MembersTyping)

export default InjectedMembersTyping
