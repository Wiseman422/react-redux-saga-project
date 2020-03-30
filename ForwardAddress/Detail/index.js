import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Link from 'react-router/lib/Link'
import { path } from 'ramda'
import FATrash from 'react-icons/lib/fa/trash'
import FATrashO from 'react-icons/lib/fa/trash-o'
import FACogs from 'react-icons/lib/fa/cogs'
import FAEnvelope from 'react-icons/lib/fa/envelope'
import FAExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import Button from 'react-bootstrap/lib/Button'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import { timeAgo } from 'commons/Lib/Utils'
import Actions from 'commons/Redux/UserEmailRedux'
import { dataPresentAndParamIdChanged } from 'commons/Lib/ReactLifecycle'
import log from 'commons/Services/Log'

import CryptoView from 'app/Components/CryptoView'
import NameEmail from 'app/Components/NameEmail'
import ConfirmDialog from 'app/Components/ConfirmDialog'
import history from 'app/Routes/History'
import AnalyticsHeatmap from 'app/Components/AnalyticsHeatmap'

import DetailViewHeader from 'app/Components/Detail/ViewHeader'
import { DetailTopToolbar, DetailBottomToolbar } from 'app/Components/Detail/Toolbar'

class _ForwardAddressDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    timezone: PropTypes.string,
    params: PropTypes.object,
    className: PropTypes.string,

    data: PropTypes.object,
    isGTMdScreen: PropTypes.bool,
    isListDataAvailable: PropTypes.bool,
    prevId: PropTypes.number,
    nextId: PropTypes.number,

    heatmapRequest: PropTypes.func.isRequired,
    useremailRemove: PropTypes.func.isRequired,
    useremailRequestConfirmation: PropTypes.func.isRequired,

    setIterationIds: PropTypes.func.isRequired,
    clearIterationIds: PropTypes.func.isRequired
  }

  static defaultProps = {
    className: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      showConfirmDelete: false
    }
    this._trashUserEmail = this._trashUserEmail.bind(this)
    this._confirmTrashUserEmail = this._confirmTrashUserEmail.bind(this)
    this._sendConfirmation = this._sendConfirmation.bind(this)
  }

  componentWillMount () {
    if (!this.props.isListDataAvailable || !this.props.data) {
      history.push('/esp')
      return
    }

    this.props.setIterationIds(this.props.params.id)

    if (this.props.data && !this.props.data.geostats) {
      this.props.heatmapRequest({ useremail_id: this.props.data.id, direction: 2 })
    }
  }

  componentDidMount () {
    ax.detailPageView(ax.EVENTS.FORWARD_ADDRESS)
  }

  componentWillReceiveProps (nextProps) {
    // If data has disappeared (due to search list data changing)
    // then just redirect back to mailbox
    if (this.props.data && !nextProps.data) {
      history.push('/esp')
      return
    }

    if (dataPresentAndParamIdChanged(this.props, nextProps)) {
      this.props.setIterationIds(nextProps.params.id)
      ax.detailPageView(ax.EVENTS.FORWARD_ADDRESS)
    }

    if (nextProps.data && nextProps.params && nextProps.params.id && !nextProps.data.geostats) {
      nextProps.heatmapRequest({ useremail_id: nextProps.data.id, direction: 2 })
    }
  }

  componentWillUnmount () {
    this.props.clearIterationIds()
  }

  _trashUserEmail () {
    const payload = {
      id: this.props.data.id,
    }

    return new Promise((resolve, reject) =>
      this.props.useremailRemove(payload, resolve, reject))
  }

  _confirmTrashUserEmail () {
    this.setState({showConfirmDelete: true})
  }

  _sendConfirmation () {
    const p = {
      id: this.props.data.id
    }

    return new Promise((resolve, reject) =>
      this.props.useremailRequestConfirmation(p, resolve, reject)
    ).then(() => {
      log.debug('request confirmation success')
    })
  }

  _renderConfirmDelete () {
    const { data, intl } = this.props
    let confirmText = (
      <div>
        <FAExclamationTriangle />&nbsp;
        <FormattedMessage
          { ...m.app.Common.confirmRemove } values={{nameStr: <b>{data.email}</b>}}
        />
      </div>
    )

    return (
      <ConfirmDialog
        bodyText={confirmText}
        cancelButtonText={intl.formatMessage(m.app.Common.cancel)}
        confirmButtonText={intl.formatMessage(m.app.Common.delete)}
        confirmHandler={this._trashUserEmail}
        cancelHandler={() => this.setState({showConfirmDelete: false})}
        dialogButton={<Button>NoOp</Button>}
        isOpened
      />
    )
  }

  _renderIdentities () {
    if (!this.props.data || !this.props.data.identities) return null

    const identities = this.props.data.identities.map(i => (
      <li key={i.id}>
        <Link to={`/identity/${i.id}`}>{i.email}</Link>
      </li>
    ))

    return (
      <div className='detail-view__foreign-items'>
        <div className='z-title'>
          <FormattedMessage {...m.app.Common.mailboxesUsedBy } /> {this.props.data.email}
        </div>
        <hr />
        <ul>
          {identities}
        </ul>
      </div>
    )
  }

  _renderBodyUnconfirmed () {
    const { data, intl } = this.props

    return (
      <div className='detail-view'>
        <div className='detail-view__header'>

          <NameEmail
            name={data.display_name}
            email={data.email}
            highlightEmailAsName
            avatar
            avatarSize={50}
            className='detail-view__name-email'
            avatarClassName='detail-view__name-email__avatar'
            nameClassName='detail-view__name-email__name'
            emailClassName='detail-view__name-email__email'
          />
          <div className='clearfix' />

          <div className='detail-round-toolbar'>
            <span className='gray-text'>
              <FormattedMessage { ...m.app.ForwardAddress.pendingConfirmation } />
            </span>&nbsp;
            <span className='red-icon'>
              <FAExclamationTriangle />
            </span>
          </div>

          <div className='sep-top-md' />
          <hr />
          <div className='z-form__help'>
            <FormattedMessage { ...m.app.ForwardAddress.notConfirmedDetail }
              values={{domainName: <b>{data.email.split('@')[1]}</b>}}
            />
            <div className='sep-top' />
            <FormattedMessage { ...m.app.ForwardAddress.lastConfirmationRequest }
              values={{lastTest: timeAgo(data.confirmation_sent_on, intl)}}
            />
            <div className='sep-top' />
            <Button bsStyle='success' type='button'
              onClick={() => this._sendConfirmation()}
            >
              <FormattedMessage {...m.app.ForwardAddress.requestNewConfirmation } />
            </Button>
          </div>

        </div>
      </div>
    )
  }

  _renderBody () {
    const { data, intl, timezone } = this.props
    return (
      <div className='detail-view'>
        <DetailViewHeader data={data} timezone={timezone} />
        <CryptoView
          readOnly
          title={intl.formatMessage(m.app.Crypto.identitySmimeAndGpgTitle)}
          email={data.email}
          pgp={data.crypto.pgp}
          smime={data.crypto.smime}
        />
        <AnalyticsHeatmap data={data.geostats} />
      </div>
    )
  }

  render () {
    const { showConfirmDelete } = this.state
    if (!this.props.data || !this.props.isListDataAvailable) return null

    const { intl, className, isGTMdScreen, params, data, nextId, prevId } = this.props

    let body = data.is_confirmed ? this._renderBody() : this._renderBodyUnconfirmed()

    return (
      <div className={className}>
        <DetailTopToolbar
          isGTMdScreen={isGTMdScreen}
          indexName={intl.formatMessage(m.app.ForwardAddress.forwardAddress)}
          indexPath='/esp'
          prevPath={prevId ? `/esp/${prevId}` : null}
          nextPath={nextId ? `/esp/${nextId}` : null}
          leftButtons={[
            {
              icon: FACogs,
              trans: m.app.Tooltips.edit,
              to: `/esp/${data.id}/edit`,
              disabled: !data.is_confirmed
            },
            {
              icon: FATrashO,
              trans: m.app.Tooltips.deleteItemName,
              onClick: this._confirmTrashUserEmail,
              small: true
            }
          ]}
        />
        { body }
        { showConfirmDelete && this._renderConfirmDelete() }
        <DetailBottomToolbar
          isGTMdScreen={isGTMdScreen}
          options={[
            {icon: FACogs, to: `/esp/${params.id}/edit`},
            {icon: FATrash, onClick: this._confirmTrashUserEmail},
            {icon: FAEnvelope}
          ]}
        />
      </div>
    )
  }
}

const mapDispatchToProps = {
  useremailRemove: Actions.useremailRemove,
  useremailRequestConfirmation: Actions.useremailRequestConfirmation,
  heatmapRequest: Actions.heatmapRequest,
  setIterationIds: Actions.useremailSetIterationIds,
  clearIterationIds: Actions.useremailClearIterationIds
}

const mapStateToProps = (state, ownProps) => {
  const data =
    path(['useremail', 'searchResultsData', ownProps.params.id], state) ||
    path(['useremail', 'data', ownProps.params.id], state)

  return {
    isListDataAvailable: !!(state.useremail.data || state.useremail.searchResultsData),
    data: data,
    nextId: state.useremail.nextId,
    prevId: state.useremail.prevId,
    isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
    timezone: state.user.data.timezone
  }
}

const IntlInjected = injectIntl(_ForwardAddressDetail)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
