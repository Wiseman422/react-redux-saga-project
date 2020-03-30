import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import classnames from 'classnames'

import ChatActions from 'commons/Redux/ChatRedux'
import { isRoomE2EEWithoutOtherMembers } from 'commons/Selectors/Messaging'

import history from 'app/Routes/History'

import MessageList from './components/MessageList'
import MembersTyping from './components/MembersTyping'
import PleaseSelectRoom from './components/PleaseSelectRoom'
import LoadingMessages from './components/LoadingMessages'
import WaitingForMember from './components/WaitingForMember'
import SwitchTabs from './components/SwitchTabs'

import { getComposeHeight } from '../utils'

class Room extends Component {
  static propTypes = {
    data: PropTypes.object,
    params: PropTypes.object,
    composeHeight: PropTypes.number.isRequired,
    isListDataAvailable: PropTypes.bool.isRequired,
    chatGetMessagesRequest: PropTypes.func.isRequired,
    roomIsE2EEWithoutOtherMembers: PropTypes.bool.isRequired,
    roomDetailOpen: PropTypes.bool,
    isE2ee: PropTypes.bool,
    messagesData: PropTypes.object.isRequired
  }

  componentWillMount () {
    if (this.props.params.id && !this.props.isListDataAvailable) {
      history.replace('/chat')
    }
  }

  componentWillReceiveProps (nextProps) {
    if (
      !nextProps.data ||
      nextProps.isE2ee ||
      nextProps.data.noMoreMessagesAvailable
    ) {
      return
    }

    if (
      this.props.data &&
      nextProps.data.room_id === this.props.data.room_id
    ) {
      return
    }

    if (nextProps.messagesData.messageIds && nextProps.messagesData.messageIds.length) {
      return
    }

    nextProps.chatGetMessagesRequest(nextProps.data.room_id)
  }

  render () {
    const { composeHeight, data, roomIsE2EEWithoutOtherMembers, messagesData } = this.props
    const roomClass = {
      'msging__room': true,
      'msging__room__room-detail-open': this.props.roomDetailOpen
    }

    if (!data) {
      return <PleaseSelectRoom />
    }
    if (data.isLoadingMessages && (!messagesData.messageIds || !messagesData.messageIds.length)) {
      return <LoadingMessages />
    }
    if (roomIsE2EEWithoutOtherMembers) {
      return <WaitingForMember />
    }
    return (
      <div className={classnames(roomClass)} style={{ bottom: `${composeHeight}px` }} >
        { this.props.videoCallRemoteFeedURL && <video src={this.props.videoCallRemoteFeedURL} style={{height: 200, width: 200}} autoPlay /> }
        <MessageList data={data} messagesData={messagesData} isE2ee={this.props.isE2ee} />
        <MembersTyping data={data} />
        <SwitchTabs {...this.props} />
      </div>
    )
  }
}

const getMessagesData = (props) => {
  const nullData = {
    messageIds: [],
    messages: {}
  }
  if (!props.data) {
    return nullData
  }
  if (props.isE2ee) {
    if (!props.data.e2ee) {
      return nullData
    }
    return props.data.e2ee
  } else {
    if (!props.data.regular) {
      return nullData
    }
    return props.data.regular
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {
    videoCallRemoteFeedURL: state.chat.videoCallRemoteFeedURL,
    isListDataAvailable: !!(state.chat.data || state.chat.searchResultsData),
    composeHeight: getComposeHeight(state),
    roomIsE2EEWithoutOtherMembers: isRoomE2EEWithoutOtherMembers(state, ownProps.params.id)
  }

  props.messagesData = getMessagesData(ownProps)

  return props
}

const mapDispatchToProps = {
  chatGetMessagesRequest: ChatActions.chatGetMessagesRequest
}

const ConnectedRoom = connect(mapStateToProps, mapDispatchToProps)(Room)

const RoomWithRouter = withRouter(ConnectedRoom)

export default RoomWithRouter
