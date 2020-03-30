import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import classnames from 'classnames'
import FAClose from 'react-icons/lib/fa/times-circle'
import FASpinner from 'react-icons/lib/fa/circle-o-notch'

import Actions from 'commons/Redux/ChatRedux'

import history from 'app/Routes/History'
import RoomTitle from './RoomTitle'

class RoomItem extends Component {

  static propTypes = {
    data: PropTypes.shape({
      room_id: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,
    chatLeaveRoom: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this._isActive = this._isActive.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this._handleClose = this._handleClose.bind(this)
    this._renderUnread = this._renderUnread.bind(this)
    this._renderClose = this._renderClose.bind(this)
  }

  _isActive () {
    const { data, params } = this.props
    return data.room_id === params.id
  }

  _handleClick () {
    const { data } = this.props
    if (this._isActive()) return
    history.push(`/chat/${data.room_id}`)
  }

  _handleClose (ev) {
    ev.stopPropagation()
    const { data } = this.props
    this.props.chatLeaveRoom(data.room_id)
    if (this._isActive()) {
      history.push(`/chat`)
    }
  }

  _renderClose () {
    const { data } = this.props
    return (
      <div className='msging__room-list__li__close' onClick={this._handleClose}>
        {data.isLeavingRoom ? <FASpinner className='spinning' /> : <FAClose />}
      </div>
    )
  }

  _renderUnread () {
    const { data } = this.props
    return (
      <div className='msging__room-list__li__unread'>
        {data.unreadCount}
      </div>
    )
  }

  render () {
    const { data, params } = this.props

    const baseClass = {
      'msging__room-list__li': true,
      'msging__room-list__li__active': data.room_id === params.id
    }

    const titleClass = {
      'msging__room-list__li__txt': true,
      'msging__room-list__li__txt--bold': data.unreadCount
    }

    return (
      <li
        className={classnames(baseClass)}
        onClick={this._handleClick}
      >
        <RoomTitle data={data} className={classnames(titleClass)} />
        {data.unreadCount ? this._renderUnread() : this._renderClose()}
      </li>
    )
  }
}

const mapDispatchToProps = ({
  chatLeaveRoom: Actions.chatLeaveRoomRequest
})

const ConnectedRoomItem = connect(null, mapDispatchToProps)(RoomItem)

const RoomItemWithRouter = withRouter(ConnectedRoomItem)

export default RoomItemWithRouter
