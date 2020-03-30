import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path, isNil } from 'ramda'
import { intlShape, injectIntl } from 'react-intl'

import MailboxActions from 'commons/Redux/MailboxRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import ax from 'commons/Services/Analytics/index'

import history from 'app/Routes/History'

import Header from './components/Header'
import ActionToolbar from './components/ActionToolbar'
import Body from './components/Body'
import Attachments from './components/Attachments'
import { MailboxAnalytics } from '../Analytics'

class _MailboxDetail extends Component {
  static propTypes = {
    data: PropTypes.object,
    avatarImage: PropTypes.string,
    filterName: PropTypes.string,
    setIterationIds: PropTypes.func,
    clearIterationIds: PropTypes.func,
    detailRequest: PropTypes.func,
    readRequest: PropTypes.func,
    saveAttachment: PropTypes.func,
    params: PropTypes.object,
    isGTMdScreen: PropTypes.bool,
    isListDataAvailable: PropTypes.bool,
    loadRemoteContent: PropTypes.bool,
    loadEmbeddedImage: PropTypes.bool,
    getContact: PropTypes.func,
    className: PropTypes.string,
    contact: PropTypes.object,
    timezone: PropTypes.string,
    intl: intlShape
  }

  static defaultProps = {
    className: ''
  }

  constructor (props) {
    super(props)

    this._showImages = this._showImages.bind(this)
    this._detailRequest = this._detailRequest.bind(this)
    this._updateRemoteContentRules = this._updateRemoteContentRules.bind(this)

    this.state = {
      imagesVisible: false,
      embeddedVisible: false
    }
  }

  _updateRemoteContentRules (props) {
    props = props || this.props
    if (!props.data) return
    // fetch the contact details if not present in redux store
    const contact = props.contact
    const contactKey = props.data.direction === 1 ? 'msg_to' : 'msg_from'
    if (contact && contact.email === props.data[contactKey]) {
      if (contact.pref_mail_load_remote_content === null) {
        this.setState({ imagesVisible: props.loadRemoteContent })
      } else {
        this.setState({ imagesVisible: contact.pref_mail_load_remote_content })
      }
      if (contact.pref_mail_load_embedded_image === null) {
        this.setState({ embeddedVisible: props.loadEmbeddedImage })
      } else {
        this.setState({ embeddedVisible: contact.pref_mail_load_embedded_image })
      }
    } else {
      if (!props.contactRequestInProgress) {
        this.props.getContact({ search: {contact_email: props.data[contactKey]}, limit: 1 })
      }
    }
  }

  componentWillMount () {
    if (!this.props.isListDataAvailable) {
      history.push('/mailbox')
    }
  }

  componentDidMount () {
    ax.detailPageView(ax.EVENTS.MAILBOX)
    this._processMail(this.props.data)
    this._updateRemoteContentRules()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.params && nextProps.params && this.props.params.id && nextProps.params.id && this.props.params.id !== nextProps.params.id) {
      ax.detailPageView(ax.EVENTS.MAILBOX)
      this._processMail(nextProps.data)

      if (this.state.imagesVisible) {
        this.setState({imagesVisible: false})
      }
    }

    // If data has disappeared (due to search list data changing)
    // then just redirect back to mailbox
    if (this.props.data && !nextProps.data) {
      history.push('/mailbox')
    }

    // Re-fetch mailbox is_msgsafe_store if list is refreshed
    // (causing data.detail to be cleared) with detail view open
    if (
      this.props.data && nextProps.data &&
      this.props.params && nextProps.params &&
      this.props.params.id &&
      this.props.params.id === nextProps.params.id &&
      this.props.data.detail && !nextProps.data.detail &&
      nextProps.data.is_msgsafe_store
    ) {
      nextProps.detailRequest(nextProps.data.id)
    }

    this._updateRemoteContentRules(nextProps)
  }

  componentWillUnmount () {
    this.props.clearIterationIds()
  }

  _detailRequest () {
    this.props.detailRequest(this.props.data.id)
  }

  _showImages () {
    this.setState({imagesVisible: true})
  }

  _processMail (data) {
    if (!data) return

    this.props.setIterationIds(data.id)

    if (!data.detail && data.is_msgsafe_store) {
      this.props.detailRequest(data.id)
    }

    if (!data.is_read) {
      this.props.readRequest(data.id)
    }
  }

  render () {
    if (!this.props.data || !this.props.isListDataAvailable) return null
    const { data, avatarImage, isGTMdScreen, className, filterName, params } = this.props
    const isForwarded = data.is_contact_to_identity && !data.is_msgsafe_store
    return (
      <div className={`mailbox-detail ${className}`}>
        <ActionToolbar data={data} indexName={filterName} />
        <Header
          timezone={this.props.timezone}
          data={data}
          contact={this.props.contact}
          avatarImage={avatarImage}
          isGTMdScreen={isGTMdScreen}
          intl={this.props.intl}
          indexName={filterName}
        />
        <Body
          data={data}
          imagesVisible={this.state.imagesVisible}
          embeddedVisible={this.state.embeddedVisible}
          showImages={this._showImages}
          reload={this._detailRequest}
          saveAttachment={this.props.saveAttachment}
        />
        <Attachments data={data} saveAttachment={this.props.saveAttachment} />

        { isForwarded && <br />}
        { isForwarded && <MailboxAnalytics embedded params={params} />}

        { !isGTMdScreen ? <ActionToolbar data={data} indexName={filterName} bottom /> : null }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const data =
    path(['mailbox', 'searchResultsData', ownProps.params.id], state) ||
    path(['mailbox', 'data', ownProps.params.id], state)

  const p = {
    isListDataAvailable: !!(state.mailbox.data || state.mailbox.searchResultsData),
    data: data,
    filterName: state.mailbox.filterName || 'Inbox',
    isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
    userAccessId: state.user.data.access_id,
    userSecretToken: state.user.data.secret_token,
    avatarImage: data && path(['avatar', 'emails', data.msg_from], state),
    loadRemoteContent: state.user.data.pref_mail_load_remote_content,
    loadEmbeddedImage: state.user.data.pref_mail_load_embedded_image,
    contactRequestInProgress: state.contact.api.getContact.inProgress,
    timezone: state.user.data.timezone
  }

  p.contact = null

  let contactKey = null
  if (data) contactKey = data.direction === 1 ? 'msg_to' : 'msg_from'

  if (
    data &&
    state.contact.data &&
    state.contact.data[data[contactKey]] &&
    state.contact.data[data[contactKey]].email === data[contactKey]
  ) {
    p.contact = state.contact.data[data[contactKey]]
  }

  if (
    !p.contact &&
    data &&
    state.contact.cache &&
    state.contact.cache[data[contactKey]] &&
    state.contact.cache[data[contactKey]].email === data[contactKey]
  ) {
    p.contact = state.contact.cache[data[contactKey]]
  }

  return p
}

const mapDispatchToProps = {
  detailRequest: MailboxActions.mailboxDetailRequest,
  readRequest: MailboxActions.mailboxReadRequest,
  setIterationIds: MailboxActions.mailboxSetIterationIds,
  clearIterationIds: MailboxActions.mailboxClearIterationIds,
  saveAttachment: MailboxActions.mailboxSaveAttachment,
  getContact: ContactActions.getContactRequest
}

const IntlInjected = injectIntl(_MailboxDetail)
export const MailboxDetail = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
