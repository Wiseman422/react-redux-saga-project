import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import FALeft from 'react-icons/lib/fa/chevron-left'
import FAClose from 'react-icons/lib/fa/close'

import m from 'commons/I18n'

import RoomTitle from '../RoomList/components/RoomTitle'

class Toolbar extends Component {
  static propTypes = {
    intl: intlShape,
    data: PropTypes.object,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    roomListOpen: PropTypes.bool,
    toggleRoomList: PropTypes.func.isRequired,
    roomDetailOpen: PropTypes.bool,
    toggleRoomDetail: PropTypes.func.isRequired,
    callContact: PropTypes.func.isRequired,
    emailContact: PropTypes.func.isRequired,
    exportContactVcard: PropTypes.func.isRequired,
    roomActions: PropTypes.array
  }

  constructor (props) {
    super(props)
    this._renderLeft = this._renderLeft.bind(this)
    this._renderRight = this._renderRight.bind(this)
  }

  _renderLeft () {
    let actionIcon = null
    const {
      roomListOpen: open,
      intl,
      data
    } = this.props
    const fm = intl.formatMessage
    if (open) {
      actionIcon = (
        <div className='msging__toolbar__tool msging__toolbar__tool__close' title={fm(m.app.Common.close)} >
          <FAClose onClick={this.props.toggleRoomList} />
        </div>
      )
    } else {
      actionIcon = (
        <div className='msging__toolbar__tool msging__toolbar__tool__open' title={fm(m.app.Chat.rooms)} >
          <FALeft onClick={this.props.toggleRoomList} />
        </div>
      )
    }
    return (
      <div className='msging__toolbar__left'>
        {actionIcon}
        {data && <RoomTitle data={data} className='msging__toolbar__title' />}
      </div>
    )
  }

  _renderRight () {
    const actions = this.props.roomActions
    const noop = () => {}
    return (
      <div className='msging__toolbar__right'>
        {actions.map((action, index) => (
          <div
            className='msging__toolbar__action'
            key={index}
            onClick={action.onClick || noop}
          >
            <div className='msging__toolbar__action__icon'>
              <action.icon />
            </div>
          </div>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div className='msging__toolbar'>
        {this._renderLeft()}
        {this._renderRight()}
      </div>
    )
  }
}

const InjectedToolbar = injectIntl(Toolbar)

export default InjectedToolbar
