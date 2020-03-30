import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import FAPlusCircle from 'react-icons/lib/fa/plus-circle'
import Modal from 'react-modal'

import RoomItem from './components/RoomItem'
import InProgress from './components/InProgress'
import CreateRoomForm from './components/CreateRoomForm'

class RoomList extends Component {
  static propTypes = {
    data: PropTypes.object,
    dataOrder: PropTypes.array,
    roomListOpen: PropTypes.bool,
    inProgress: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      roomFormOpen: false,
      roomFormShow: false
    }

    this._openRoomForm = this._openRoomForm.bind(this)
    this._closeRoomForm = this._closeRoomForm.bind(this)
    this._showRoomForm = this._showRoomForm.bind(this)
    this._renderRoomListHeader = this._renderRoomListHeader.bind(this)
    this._renderList = this._renderList.bind(this)
  }

  componentWillMount () {
    Modal.setAppElement('body')
  }

  _openRoomForm () {
    if (this.state.roomFormOpen) return
    this.setState({
      roomFormOpen: true
    })
  }

  _closeRoomForm () {
    if (!this.state.roomFormOpen) return
    this.setState({
      roomFormShow: false
    })
    setTimeout(() => this.setState({ roomFormOpen: false }), 200)
  }

  _showRoomForm () {
    if (this.state.roomFormShow) return
    this.setState({ roomFormShow: true })
  }

  _renderRoomListHeader () {
    return (
      <li
        key='encryptedChatsHeader'
        className='msging__room-list__header msging__room-list__header__encrypted'
      >
        <div className='msging__room-list__header__txt'>{'CHATS'}</div>
        <div className='msging__room-list__header__add' onClick={this._openRoomForm}>
          <FAPlusCircle />
        </div>
      </li>
    )
  }

  _renderList () {
    const { dataOrder, data } = this.props

    const list = []

    // render msgsafe encrypted chats header
    list.push(this._renderRoomListHeader())

    // render msgsafe encrypted chats rooms
    data && dataOrder && dataOrder.forEach((id) => {
      const room = data[id]
      list.push(<RoomItem key={id} data={room} />)
    }, [])

    return list
  }

  render () {
    const { roomListOpen, inProgress } = this.props

    const roomListClass = {
      'msging__room-list': true,
      'msging__room-list__open': roomListOpen
    }

    const modalClass = {
      'msging__create-room__modal': true,
      'msging__create-room__modal__show': this.state.roomFormShow
    }

    const overlayClass = {
      'msging__create-room__overlay': true,
      'msging__create-room__overlay__show': this.state.roomFormShow
    }

    return (
      <div className={classnames(roomListClass)}>
        <ul className='msging__room-list__ul'>
          {inProgress ? <InProgress /> : this._renderList()}
        </ul>
        <Modal
          isOpen={this.state.roomFormOpen}
          className={classnames(modalClass)}
          overlayClassName={classnames(overlayClass)}
          contentLabel='Create Chat Room'
          onRequestClose={this._closeRoomForm}
          onAfterOpen={this._showRoomForm}
          shouldCloseOnOverlayClick
        >
          <CreateRoomForm
            onRequestClose={this._closeRoomForm}
            onCreateRoomSubmit={this._handleSubmit}
          />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dataOrder: state.chat.dataOrder,
  data: state.chat.data,
  inProgress: state.chat.dataRequestInProgress
})

const ConnectedRoomList = connect(mapStateToProps)(RoomList)

export default ConnectedRoomList
