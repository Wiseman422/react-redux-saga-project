import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path, isNil } from 'ramda'
import FATrash from 'react-icons/lib/fa/trash-o'
import FAArchive from 'react-icons/lib/fa/archive'
import FARead from 'react-icons/lib/fa/eye'
import FAUnread from 'react-icons/lib/fa/eye-slash'
import FAReply from 'react-icons/lib/fa/mail-reply'
import FAForward from 'react-icons/lib/fa/mail-forward'
import FASent from 'react-icons/lib/fa/paper-plane'
import Trail from 'app/Components/Icons/Trail'
import FaPencilSquareO from 'app/Components/Icons/FAPencilSquareO'

import m from 'commons/I18n/'
import MailboxActions, { MSG_STATE } from 'commons/Redux/MailboxRedux'

import history from 'app/Routes/History'
import { DetailTopToolbar, DetailBottomToolbar } from 'app/Components/Detail/Toolbar'

class _MailboxDetailActionToolbar extends Component {
  static propTypes = {
    data: PropTypes.object,
    bottom: PropTypes.bool,

    isGTMdScreen: PropTypes.bool,
    indexName: PropTypes.string.isRequired,
    prevId: PropTypes.number,
    nextId: PropTypes.number,
    mailboxReadRequest: PropTypes.func,
    mailboxUnreadRequest: PropTypes.func,
    mailboxTrashRequest: PropTypes.func,
    mailboxDeleteRequest: PropTypes.func,
    mailboxClearTrashRequest: PropTypes.func,
    mailboxArchiveRequest: PropTypes.func,
    mailboxSendQueuedRequest: PropTypes.func,
    inSearchResultsData: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._archiveMail = this._archiveMail.bind(this)
    this._trashMail = this._trashMail.bind(this)
    this._deleteMail = this._deleteMail.bind(this)
    this._toggleReadStatus = this._toggleReadStatus.bind(this)
    this._sendQueuedMail = this._sendQueuedMail.bind(this)
  }

  _handleMailRemoval () {
    const { prevId, nextId } = this.props

    if (nextId || prevId) {
      history.push(`/mailbox/${nextId || prevId}`)
    } else {
      history.push('/mailbox')
    }
  }
  _trashMail () {
    this._handleMailRemoval()
    this.props.mailboxTrashRequest(this.props.data.id)
  }

  _deleteMail () {
    this._handleMailRemoval()
    this.props.mailboxDeleteRequest(this.props.data.id)
  }

  _archiveMail () {
    this._handleMailRemoval()
    this.props.mailboxArchiveRequest(this.props.data.id)
  }

  _sendQueuedMail () {
    this._handleMailRemoval()
    this.props.mailboxSendQueuedRequest(this.props.data.id)
  }

  _toggleReadStatus () {
    if (this.props.data.is_read) {
      this.props.mailboxUnreadRequest(this.props.data.id)
    } else {
      this.props.mailboxReadRequest(this.props.data.id)
    }
  }

  _getToolbarOptionsQueued () {
    const { indexName, inSearchResultsData } = this.props
    const shouldDelete = ['trash', 'queued', 'forwarded'].indexOf(indexName.toLowerCase()) !== -1 && inSearchResultsData
    return [
      {
        icon: FASent,
        onClick: this._sendQueuedMail,
        tooltipTrans: m.app.Tooltips.sendQueuedMail
      },
      {
        icon: FATrash,
        onClick: shouldDelete ? this._deleteMail : this._trashMail,
        tooltipTrans: shouldDelete ? m.app.Tooltips.deleteItemName : m.app.Mailbox.moveToTrash
      }
    ]
  }

  _getToolbarOptions () {
    const { data, indexName, inSearchResultsData } = this.props

    const isDetailPresent = !!data.detail

    const shouldDelete = ['trash', 'queued', 'forwarded'].indexOf(indexName.toLowerCase()) !== -1 && inSearchResultsData
    const isForwarded = data.is_contact_to_identity && !data.is_msgsafe_store
    const actions = []

    actions.push({
      icon: FAReply,
      to: isDetailPresent ? `/mailbox/${data.id}/reply` : null,
      disabled: !isDetailPresent,
      tooltipTrans: m.app.Tooltips.replyToeMail
    })

    actions.push({
      icon: FAForward,
      to: isDetailPresent ? `/mailbox/${data.id}/forward` : null,
      disabled: !isDetailPresent,
      tooltipTrans: m.app.Tooltips.forwardeMail
    })

    actions.push({
      icon: data.is_read ? FAUnread : FARead,
      onClick: this._toggleReadStatus,
      tooltipTrans: m.app.Tooltips.toggleReadeMail
    })

    if (!data.is_archive) {
      actions.push({
        icon: FAArchive,
        onClick: this._archiveMail,
        tooltipTrans: m.app.Tooltips.archiveeMail
      })
    }

    if (!isForwarded) {
      actions.push({
        icon: Trail,
        to: `/mailbox/${data.id}/analytics`,
        tooltipTrans: m.app.Tooltips.emailPathAnalytics,
        large: true
      })
    }

    actions.push({
      icon: FATrash,
      onClick: shouldDelete ? this._deleteMail : this._trashMail,
      tooltipTrans: shouldDelete ? m.app.Tooltips.deleteItemName : m.app.Mailbox.moveToTrash
    })

    return actions
  }

  render () {
    const { bottom, data, indexName, prevId, nextId, isGTMdScreen } = this.props

    const options = (data && data.msg_state === MSG_STATE.SEND_QUEUED)
        ? this._getToolbarOptionsQueued() : this._getToolbarOptions()

    if (bottom) {
      return <DetailBottomToolbar options={options} />
    }

    return (
      <DetailTopToolbar
        isGTMdScreen={isGTMdScreen}
        indexName={indexName}
        indexPath='/mailbox'
        prevPath={prevId ? `/mailbox/${prevId}` : null}
        nextPath={nextId ? `/mailbox/${nextId}` : null}
        rightButtons={[{
          icon: FaPencilSquareO,
          to: '/mailbox/new',
          trans: m.app.Tooltips.compose
        }]}
        leftButtons={options}
        allLeftButtonsSmall
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  nextId: state.mailbox.nextId,
  prevId: state.mailbox.prevId,
  isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
  inSearchResultsData: state.mailbox.searchResultsData && !isNil(state.mailbox.searchResultsData[ownProps.data.id])
})

const mapDispatchToProps = {
  mailboxReadRequest: MailboxActions.mailboxReadRequest,
  mailboxUnreadRequest: MailboxActions.mailboxUnreadRequest,
  mailboxArchiveRequest: MailboxActions.mailboxArchiveRequest,
  mailboxTrashRequest: MailboxActions.mailboxTrashRequest,
  mailboxClearTrashRequest: MailboxActions.mailboxClearTrashRequest,
  mailboxDeleteRequest: MailboxActions.mailboxDeleteRequest,
  mailboxSendQueuedRequest: MailboxActions.mailboxSendQueuedRequest
}

const ActionToolbar = connect(mapStateToProps, mapDispatchToProps)(_MailboxDetailActionToolbar)
export default ActionToolbar
