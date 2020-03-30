import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import debounce from 'debounce'
import moment from 'moment'

import m from 'commons/I18n'
import { uuidv1ToDate } from 'commons/Lib/Utils'
import ChatActions from 'commons/Redux/ChatRedux'

import history from 'app/Routes/History'

import Message from './Message'
import DateSeperator from './DateSeperator'
import FetchingMore from './FetchingMore'
import NoMoreMessages from './NoMoreMessages'

const MAX_AUTO_SCROLL_ON = 30
const SCROLL_CONTROL_TOP = 'MESSAGE_LIST_SCROLL_CONTROL_TOP'
const SCROLL_CONTROL_BOTTOM = 'MESSAGE_LIST_SCROLL_CONTROL_BOTTOM'

class MessageList extends Component {

  static propTypes = {
    data: PropTypes.object,
    isE2ee: PropTypes.bool,
    intl: intlShape,
    messagesData: PropTypes.object,
    params: PropTypes.object,
    isListDataAvailable: PropTypes.bool.isRequired,
    timezone: PropTypes.string.isRequired,
    chatAckMessage: PropTypes.func.isRequired,
    chatGetMessagesRequest: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      isScrollable: false,

      // Local cache of the messageIds.
      // We keep messageIds in state to trigger rerender
      // when it changes
      messageIds: []
    }

      // we cache time calculations, uuidv1ToDate, _getMomentTime, _getMomentTimeString
    this._time = {
      // uuidv1: {
      //   date: Date,
      //   momentTime: moment(),
      //   momentTimeString: string human readable
      // }
    }

    /**
     * Trackers
     */
    // the current scroll position relative to bottom
    this._scrollBottom = 0
    // the position relative to top to which the view will auto scroll
    // on each componentDidUpdate
    this._autoScrollTopTo = 0
    // the current scroll position relative to top
    this._scrollTop = 0
    // the position relative to top to which the view will auto scroll
    // on each componentDidUpdate
    this._autoScrollBottomTo = 0
    // which scroll position is in control
    this._scrollControl = SCROLL_CONTROL_BOTTOM

    // bind methods
    this._ref = this._ref.bind(this)
    this._getLastMessageOwner = this._getLastMessageOwner.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this._getScrollBottom = this._getScrollBottom.bind(this)
    this._setScrollBottom = this._setScrollBottom.bind(this)
    this._getScrollTop = this._getScrollTop.bind(this)
    this._setScrollTop = this._setScrollTop.bind(this)
    this._didMessageAppend = this._didMessageAppend.bind(this)
    this._didMessagePrepend = this._didMessagePrepend.bind(this)
    this._getLastMessageId = this._getLastMessageId.bind(this)
    this._getFirstMessageId = this._getFirstMessageId.bind(this)
    this._updateMessagesCache = this._updateMessagesCache.bind(this)
    this._getMomentTime = this._getMomentTime.bind(this)
    this._updateAutoScroll = this._updateAutoScroll.bind(this)
    this._updateTrackers = this._updateTrackers.bind(this)
    this._updateScrollable = this._updateScrollable.bind(this)
    this._fillRoomWithMessages = debounce(this._fillRoomWithMessages.bind(this), 200)
    this._renderList = this._renderList.bind(this)
    this._onWindowResize = this._onWindowResize.bind(this)
  }

  _ref (n) {
    this.scrollElement = n
    if (n) {
      this._setScrollBottom(this._autoScrollBottomTo)
    }
  }

  _getLastMessageOwner (data) {
    if (!data.messageIds || !data.messages) return null
    const lastMessageId = data.messageIds[data.messageIds.length - 1]
    const lastMessage = data.messages[lastMessageId]
    return lastMessage.user_from
  }

  _handleScroll () {
    const { chatGetMessagesRequest, params, data, isE2ee } = this.props
    if (this.scrollElement.scrollTop <= 40 && !data.noMoreMessagesAvailable && !isE2ee) {
      chatGetMessagesRequest(params.id, true)
    }
    this._scrollBottom = this._getScrollBottom()
    this._autoScrollBottomTo = this._scrollBottom
    this._scrollTop = this._getScrollTop()
    this._autoScrollTopTo = this._scrollTop
  }

  _getScrollBottom () {
    if (!this.scrollElement) return 0
    const scrollTop = this.scrollElement.scrollTop
    const fullHeight = this.scrollElement.scrollHeight
    const viewHeight = this.scrollElement.clientHeight
    const scrollBottom = fullHeight - scrollTop - viewHeight
    return scrollBottom
  }

  _setScrollBottom (scrollBottom) {
    if (!this.scrollElement) return
    const fullHeight = this.scrollElement.scrollHeight
    const viewHeight = this.scrollElement.clientHeight
    this.scrollElement.scrollTop = fullHeight - scrollBottom - viewHeight
  }

  _getScrollTop () {
    if (!this.scrollElement) return 0
    return this.scrollElement.scrollTop
  }

  _setScrollTop (scrollTop) {
    if (!this.scrollElement) return
    this.scrollElement.scrollTop = scrollTop
  }

  _didMessageAppend (nextProps) {
    const props = nextProps || this.props
    const { messageIds } = props.messagesData
    if (!messageIds || !messageIds.length) return false
    const lastMessageIdIndex = messageIds.indexOf(this._getLastMessageId())
    if (lastMessageIdIndex === -1) return false
    if (lastMessageIdIndex < messageIds.length - 1) return true
  }

  _didMessagePrepend (nextProps) {
    const props = nextProps || this.props
    const { messageIds } = props.messagesData
    if (!messageIds || !messageIds.length) return false
    const firstMessageIdIndex = messageIds.indexOf(this._getFirstMessageId())
    if (firstMessageIdIndex === -1) return false
    if (firstMessageIdIndex > 0) return true
  }

  _getLastMessageId () {
    if (!this.state.messageIds || !this.state.messageIds.length) return 0
    return this.state.messageIds[this.state.messageIds.length - 1]
  }

  _getFirstMessageId () {
    if (!this.state.messageIds || !this.state.messageIds.length) return 0
    return this.state.messageIds[0]
  }

  _updateMessagesCache (nextProps) {
    if (!nextProps) return
    let { messageIds, messages } = nextProps.messagesData
    if (!messageIds) messageIds = []
    if (!messages) messages = {}
    let newMessageIds = []

    if (
      messageIds === this.props.messagesData.messageIds &&
      messages === this.props.messagesData.messages
    ) {
      return
    }

    newMessageIds = messageIds.slice(0)

    this.setState({
      messageIds: newMessageIds
    })
  }

  _updateLastMessageRead () {
    const { data, isE2ee } = this.props
    const messageIds = this.state.messageIds
    if (!data) return
    if (!messageIds.length) return

    const latestMessageId = messageIds[messageIds.length - 1]
    if (
      // Either there's no last_read_message_id at all
      !data.last_read_message_id ||
      // Or the latest message's timestamp is greater than last_read_message_id
      (
        latestMessageId !== data.last_read_message_id &&
        uuidv1ToDate(latestMessageId) > uuidv1ToDate(data.last_read_message_id)
      )
    ) {
      this.props.chatAckMessage(data.room_id, latestMessageId, isE2ee)
    }
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

  _getMomentTimeString (momentTime) {
    return momentTime.format('hh:mm a')
  }

  _updateAutoScroll (nextProps) {
    const nextData = nextProps.messagesData
    const currentData = this.props.messagesData

    // no need to continue if there are no new messages
    if (!nextData.messageIds) {
      return
    }

    // scroll to bottom if the messages are rendered first time
    if (!currentData.messageIds && nextData.messageIds) {
      this._autoScrollBottomTo = 0
      this._scrollControl = SCROLL_CONTROL_BOTTOM
      return
    }

    // if there are messages added
    if (nextData.messageIds.length > currentData.messageIds.length) {
      // if the message is prepended keep scroll at
      // it's current position relative to bottom
      if (this._didMessagePrepend(nextProps)) {
        this._scrollControl = SCROLL_CONTROL_BOTTOM

      // if the message is appended
      } else {
        // scroll to bottom if the view is at the bottom
        if (this._scrollBottom <= MAX_AUTO_SCROLL_ON) {
          this._autoScrollBottomTo = 0
          this._scrollControl = SCROLL_CONTROL_BOTTOM
        } else {
          // scroll to bottom if the user has added the message himself
          if (nextProps.data.member_email === this._getLastMessageOwner(nextData)) {
            this._autoScrollBottomTo = 0
            this._scrollControl = SCROLL_CONTROL_BOTTOM

          // if somebody else is sending a message then keep scroll
          // at it's current position relative to top
          } else {
            this._scrollControl = SCROLL_CONTROL_TOP
          }
        }
      }
    }
  }

  _updateTrackers () {
    // update the scrolls
    this._scrollBottom = this._getScrollBottom()
    this._scrollTop = this._getScrollTop()
  }

  _updateScrollable () {
    if (this.scrollElement) {
      const viewHeight = this.scrollElement.clientHeight
      const fullHeight = this.scrollElement.scrollHeight
      if (viewHeight < fullHeight && !this.state.isScrollable) {
        this.setState({ isScrollable: true })
      }
      if (viewHeight >= fullHeight && this.state.isScrollable) {
        this.setState({ isScrollable: false })
      }
    }
  }

  // There might be cases when initial messages fetched for the
  // room does not fill the entire chat room. (E.g. user has a giant screen)
  // we have to make sure that the room is filled with the messages, otherwise
  // not user friendly and also there is no scroll event to trigger pagination
  // so the user could see older messages
  _fillRoomWithMessages () {
    const { chatGetMessagesRequest, params, data, messagesData, isE2ee } = this.props
    const { messageIds } = messagesData
    if (isE2ee) {
      return // no need to auto fill page if room is in e2ee mode
    }
    if (!messageIds || !messageIds.length) {
      return // wait until initial request is finished
    }
    if (this.state.isScrollable) {
      return // already filled
    }
    if (data.isLoadingMessages) {
      return // already fetching more messages
    }
    if (data.noMoreMessagesAvailable) {
      return // no more messages to fill with
    }
    chatGetMessagesRequest(params.id, true)
  }

  _onWindowResize () {
    this._updateScrollable()
  }

  _formatRelative (momentTime) {
    const { intl } = this.props
    if (momentTime.format('YYYY-MMM-DD') === moment().format('YYYY-MMM-DD')) {
      return intl.formatMessage(m.app.Chat.today)
    }
    if (momentTime.format('YYYY-MMM-DD') === moment().subtract(1, 'days').format('YYYY-MMM-DD')) {
      return intl.formatMessage(m.app.Chat.yesterday)
    }
    return momentTime.format('MMM D(ddd)')
  }

  _computeTime (messageId) {
    if (this._time[messageId]) {
      return this._time[messageId]
    }

    const date = uuidv1ToDate(messageId)
    const momentTime = this._getMomentTime(date)
    const momentTimeString = this._getMomentTimeString(momentTime)
    const day = this._formatRelative(momentTime)

    const computedTime = {
      date,
      momentTime,
      momentTimeString,
      day
    }

    this._time[messageId] = computedTime

    return computedTime
  }

  _renderList () {
    const { data, isE2ee } = this.props
    const { member_email: identity } = data
    const messageIds = this.state.messageIds
    const list = []
    let lastDay = null
    let lastUser = null
    messageIds.forEach((messageId) => {
      const message = this.props.messagesData.messages[messageId]
      const { momentTimeString, day } = this._computeTime(messageId)
      if (lastDay !== day) {
        list.push(<DateSeperator key={`sep-${messageId}`}>{day}</DateSeperator>)
        lastDay = day
      }
      list.push(
        <Message
          key={messageId}
          messageId={messageId}
          roomId={data.room_id}
          isE2ee={isE2ee}
          momentTimeString={momentTimeString}
          identity={identity}
          lastUser={lastUser}
        />
      )
      lastUser = message.user_from
    })
    return list
  }

  componentWillMount () {
    if (this.props.params.id && !this.props.isListDataAvailable) {
      history.replace('/chat')
    }
    this._updateAutoScroll(this.props)
    this._updateMessagesCache(this.props)
  }

  componentDidMount () {
    this._updateScrollable()
    this._fillRoomWithMessages()
    this._updateLastMessageRead()
    window.addEventListener('resize', this._onWindowResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._onWindowResize)
  }

  componentWillReceiveProps (nextProps) {
    this._updateAutoScroll(nextProps)
    this._updateMessagesCache(nextProps)
  }

  componentDidUpdate () {
    // auto scroll
    if (this._scrollControl === SCROLL_CONTROL_TOP) {
      this._setScrollTop(this._autoScrollTopTo)
    } else {
      this._setScrollBottom(this._autoScrollBottomTo)
    }

    this._updateTrackers()
    this._updateScrollable()
    this._fillRoomWithMessages()
    this._updateLastMessageRead()
  }

  render () {
    const { data, isE2ee } = this.props
    if (!this.state.messageIds || !this.state.messageIds.length) {
      return null
    }
    return (
      <div
        className='msging__messages'
        ref={this._ref}
        onScroll={this._handleScroll}
      >
        {!data.noMoreMessagesAvailable && !isE2ee && <FetchingMore />}
        {
          data.noMoreMessagesAvailable &&
          this.state.isScrollable &&
          <NoMoreMessages />
        }
        {this._renderList()}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isListDataAvailable: !!(state.chat.data || state.chat.searchResultsData),
  timezone: state.user.data.timezone || ''
})

const mapDispatchToProps = {
  chatAckMessage: ChatActions.chatAckMessage,
  chatGetMessagesRequest: ChatActions.chatGetMessagesRequest
}

const ConnectedMessageList = connect(mapStateToProps, mapDispatchToProps)(MessageList)

const MessageListWithRouter = withRouter(ConnectedMessageList)

const InjectedMessageList = injectIntl(MessageListWithRouter)

export default InjectedMessageList
