import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FAAddressCard from 'react-icons/lib/fa/book'
import FAPhone from 'react-icons/lib/fa/phone'
import FAEnvelope from 'react-icons/lib/fa/envelope'
import FAInfo from 'react-icons/lib/fa/info'
import { merge } from 'ramda'

import ChatActions from 'commons/Redux/ChatRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import { getContactMember, getIdentityMember } from 'commons/Selectors/Messaging'
import { isWebRTCSupported } from 'commons/Selectors/DeviceSelectors'

import history from 'app/Routes/History'

import RoomList from './RoomList'
import Room from './Room'
import RoomHeader from './RoomHeader'
import RoomDetail from './RoomDetail'
import Compose from './Compose'
import Toolbar from './Toolbar'

class Messaging extends Component {

  static propTypes = {
    data: PropTypes.object,
    params: PropTypes.object.isRequired,
    chatInit: PropTypes.func.isRequired,
    saveVCard: PropTypes.func.isRequired,
    getContact: PropTypes.func.isRequired,
    getContactApi: PropTypes.object,
    contactCache: PropTypes.object,
    getIdentity: PropTypes.func.isRequired,
    getIdentityApi: PropTypes.object,
    identityCache: PropTypes.object,
    webRTCSupported: PropTypes.bool,
    videoCallRequest: PropTypes.func.isRequired,
    contactMember: PropTypes.object,
    identityMember: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      roomListOpen: false,
      roomDetailOpen: false,
      ephemeral: false
    }
    this._toggleRoomList = this._toggleRoomList.bind(this)
    this._toggleRoomDetail = this._toggleRoomDetail.bind(this)
    this._handleSwitchToRegular = this._handleSwitchToRegular.bind(this)
    this._handleSwitchToEphemeral = this._handleSwitchToEphemeral.bind(this)
    this._getContact = this._getContact.bind(this)
    this._getIdentity = this._getIdentity.bind(this)
    this._emailContact = this._emailContact.bind(this)
    this._exportContactVcard = this._exportContactVcard.bind(this)
    this._callContact = this._callContact.bind(this)
  }

  _toggleRoomList () {
    const roomListOpen = !this.state.roomListOpen
    let roomDetailOpen = this.state.roomDetailOpen
    if (roomDetailOpen && roomListOpen) {
      roomDetailOpen = false
    }
    this.setState({
      roomListOpen,
      roomDetailOpen
    })
  }

  _toggleRoomDetail () {
    const roomDetailOpen = !this.state.roomDetailOpen
    let roomListOpen = this.state.roomListOpen
    if (roomListOpen && roomDetailOpen) {
      roomListOpen = false
    }
    this.setState({
      roomDetailOpen,
      roomListOpen
    })
  }

  _handleSwitchToRegular () {
    if (!this.state.ephemeral) return
    this.setState({ ephemeral: false })
  }

  _handleSwitchToEphemeral () {
    if (this.state.ephemeral) return
    this.setState({ ephemeral: true })
  }

  _getContact (nextProps) {
    const props = nextProps || this.props
    const { contactMember, contactCache } = props
    if (!contactMember) return {}

    if (!contactCache) return contactMember
    return merge(contactMember, contactCache[contactMember.email] || {})
  }

  _getIdentity (nextProps) {
    const props = nextProps || this.props
    const { identityMember, identityCache } = props
    if (!identityMember) return {}

    if (!identityCache) return identityMember
    return merge(identityMember, identityCache[identityMember.email] || {})
  }

  _callContact () {
    const contact = this._getContact()
    const identity = this._getIdentity()

    if (!contact || !contact.email || !identity || !identity.email) return
    this.props.videoCallRequest(identity.email, contact.email)
  }

  _exportContactVcard () {
    const contact = this._getContact()
    if (!contact.id) return
    this.props.saveVCard(contact.id)
  }

  _emailContact () {
    const contact = this._getContact()
    if (!contact.email) return
    history.push(`/mailbox/new/to/${contact.email}`)
  }

  _getRoomActions () {
    const contact = this._getContact()
    const identity = this._getIdentity()
    const actions = []

    if (this.props.data) {
      actions.push({ icon: FAInfo, label: 'Info', onClick: this._toggleRoomDetail })
    }

    if (contact.email) {
      actions.push({ icon: FAEnvelope, label: 'Email', onClick: this._emailContact })
    }

    if (contact.email && identity.email) {
      actions.push({ icon: FAPhone, label: 'Call', onClick: this._callContact })
    }

    if (contact.id) {
      actions.push({ icon: FAAddressCard, label: 'VCard', onClick: this._exportContactVcard })
    }

    return actions
  }

  componentDidMount () {
    this.props.chatInit()
  }

  componentWillReceiveProps (nextProps) {
    // on mobile view when user selects a room different than
    // already chosen, close the roomList
    if (this.props.params.id !== nextProps.params.id) {
      this.setState({ roomListOpen: false })
    }

    // make sure we have info of the contact
    // of the active chat room
    const contact = this._getContact(nextProps)
    if (!nextProps.getContactApi.inProgress && contact.email) {
      if (!nextProps.contactCache || !nextProps.contactCache[contact.email]) {
        this.props.getContact({ search: { contact_email: contact.email }, limit: 1 })
      }
    }

    // make sure we have info of the identity
    // of the active chat room
    const identity = this._getIdentity(nextProps)
    if (!nextProps.getIdentityApi.inProgress && identity.email) {
      if (!nextProps.identityCache || !nextProps.identityCache[identity.email]) {
        this.props.getIdentity({ search: { identity_email: identity.email }, limit: 1 })
      }
    }
  }

  render () {
    const { data } = this.props
    const childProps = {
      data,
      isE2ee: this.state.ephemeral,
      callContact: this._callContact,
      emailContact: this._emailContact,
      exportContactVcard: this._exportContactVcard,
      contact: this._getContact(),
      identity: this._getIdentity(),
      toggleRoomList: this._toggleRoomList,
      roomListOpen: this.state.roomListOpen,
      toggleRoomDetail: this._toggleRoomDetail,
      roomDetailOpen: this.state.roomDetailOpen,
      roomActions: this._getRoomActions(),
      handleSwitchToEphemeral: this._handleSwitchToEphemeral,
      handleSwitchToRegular: this._handleSwitchToRegular
    }
    return (
      <div className='msging__container'>
        <RoomList {...childProps} />
        <Toolbar {...childProps} />
        <RoomHeader {...childProps} />
        <Room {...childProps} />
        <Compose {...childProps} />
        <RoomDetail {...childProps} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {
    contactCache: state.contact.cache,
    getContactApi: state.contact.api.getContact,
    identityCache: state.identity.cache,
    getIdentityApi: state.identity.api.getIdentity,
    webRTCSupported: isWebRTCSupported(state)
  }

  if (ownProps.params && ownProps.params.id && state.chat.dataOrder) {
    props.data = state.chat.data[ownProps.params.id]

    if (props.data && props.data.members) {
      let contactMember = getContactMember(props.data)
      let identityMember = getIdentityMember(props.data)

      contactMember = {
        ...contactMember,
        avatar: state.avatar.emails[contactMember.email]
      }

      identityMember = {
        ...identityMember,
        avatar: state.avatar.emails[identityMember.email]
      }

      props.contactMember = contactMember
      props.identityMember = identityMember
    }
  }

  return props
}

const mapDispatchToProps = {
  chatInit: ChatActions.chatInit,
  videoCallRequest: ChatActions.makeOutboundVideoCallOffer,
  saveVCard: ContactActions.contactSaveVCard,
  getContact: ContactActions.getContactRequest,
  getIdentity: IdentityActions.getIdentityRequest
}

const ConnectedMessaging = connect(mapStateToProps, mapDispatchToProps)(Messaging)

export const MessagingRoute = {
  component: ConnectedMessaging,
  path: '/chat',
  childRoutes: [
    { path: '/chat/:id' }
  ]
}

export default Messaging
