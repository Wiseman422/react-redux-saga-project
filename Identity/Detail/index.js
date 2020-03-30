import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'
import FATrash from 'react-icons/lib/fa/trash'
import FATrashO from 'react-icons/lib/fa/trash-o'
import FACogs from 'react-icons/lib/fa/cogs'
import FAEnvelope from 'react-icons/lib/fa/envelope'
import FAExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import Button from 'react-bootstrap/lib/Button'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import Actions from 'commons/Redux/IdentityRedux'
import { CRYPTOAPI } from 'commons/Redux/CryptoRedux'
import { dataPresentAndParamIdChanged } from 'commons/Lib/ReactLifecycle'
import ax from 'commons/Services/Analytics/index'

import history from 'app/Routes/History'
import ConfirmDialog from 'app/Components/ConfirmDialog'
import AnalyticsHeatmap from 'app/Components/AnalyticsHeatmap'
import CryptoView from 'app/Components/CryptoView'
import DetailViewHeader from 'app/Components/Detail/ViewHeader'
import { DetailTopToolbar, DetailBottomToolbar } from 'app/Components/Detail/Toolbar'

class _IdentityDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    params: PropTypes.object,
    className: PropTypes.string,
    timezone: PropTypes.string,

    data: PropTypes.object,
    isGTMdScreen: PropTypes.bool,
    isListDataAvailable: PropTypes.bool,
    prevId: PropTypes.number,
    nextId: PropTypes.number,
    avatarImage: PropTypes.string,

    heatmapRequest: PropTypes.func.isRequired,
    cryptoRequest: PropTypes.func.isRequired,
    identityRemove: PropTypes.func.isRequired,
    setIterationIds: PropTypes.func.isRequired,
    clearIterationIds: PropTypes.func.isRequired
  }

  static defaultProps = {
    className: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      showConfirmDelete: false,
    }

    this._trashIdentity = this._trashIdentity.bind(this)
    this._confirmTrashIdentity = this._confirmTrashIdentity.bind(this)
  }

  componentWillMount () {
    if (!this.props.isListDataAvailable || !this.props.data) {
      history.push('/identity')
      return
    }

    this.props.setIterationIds(this.props.data.id)

    this.props.heatmapRequest({ identity_id: this.props.data.id, direction: 2 })

    const cryptoPayload = {
      id: this.props.data.id,
      filter: {
        identity_id: this.props.data.id,
        owner_type: CRYPTOAPI.OWNER_TYPE.IDENTITY_EMAIL
      }
    }
    this.props.cryptoRequest(cryptoPayload)
  }

  componentDidMount () {
    ax.detailPageView(ax.EVENTS.IDENTITY)
  }

  componentWillReceiveProps (nextProps) {
    // If data has disappeared (due to search list data changing)
    // then just redirect back to mailbox
    if (this.props.data && !nextProps.data) {
      history.push('/identity')
      return
    }

    if (dataPresentAndParamIdChanged(this.props, nextProps)) {
      this.props.setIterationIds(nextProps.params.id)
      ax.detailPageView(ax.EVENTS.IDENTITY)
    }

    if (nextProps.data && nextProps.params && nextProps.params.id && !nextProps.data.geostats) {
      nextProps.heatmapRequest({ identity_id: nextProps.data.id, direction: 2 })
    }

    if (nextProps.data && nextProps.params && nextProps.params.id && !nextProps.data.keys) {
      const cryptoPayload = {
        id: this.props.data.id,
        filter: {
          identity_id: this.props.data.id,
          owner_type: CRYPTOAPI.OWNER_TYPE.IDENTITY_EMAIL
        }
      }
      nextProps.cryptoRequest(cryptoPayload)
    }
  }

  componentWillUnmount () {
    this.props.clearIterationIds()
  }

  _trashIdentity () {
    const payload = {
      id: this.props.data.id
    }
    return new Promise((resolve, reject) =>
      this.props.identityRemove(payload, resolve, reject))
  }

  _confirmTrashIdentity () {
    this.setState({showConfirmDelete: true})
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
        confirmHandler={this._trashIdentity}
        cancelHandler={() => this.setState({showConfirmDelete: false})}
        dialogButton={<Button>NoOp</Button>}
        isOpened
      />
    )
  }

  _renderBody () {
    const { data, avatarImage, intl, timezone } = this.props

    let cryptoView = null
    if (data.keys && data.keys.length === 2) {
      cryptoView = (
        <CryptoView
          readOnly
          title={intl.formatMessage(m.app.Crypto.identitySmimeAndGpgTitle)}
          email={data.email}
          pgp={data.keys[0]}
          smime={data.keys[1]}
        />
      )
    }

    return (
      <div className='detail-view'>
        <DetailViewHeader data={data} avatarImage={avatarImage} timezone={timezone} />
        { cryptoView }
        <AnalyticsHeatmap data={data.geostats} />
      </div>
    )
  }

  render () {
    const { showConfirmDelete } = this.state
    if (!this.props.data || !this.props.isListDataAvailable) return null

    const { intl, className, isGTMdScreen, params, nextId, prevId } = this.props
    const confirmDeleteModal = this._renderConfirmDelete()

    return (
      <div className={className}>
        <DetailTopToolbar
          isGTMdScreen={isGTMdScreen}
          indexName={intl.formatMessage(m.app.Identity.listTitle)}
          indexPath='/identity'
          prevPath={prevId ? `/identity/${prevId}` : null}
          nextPath={nextId ? `/identity/${nextId}` : null}
          leftButtons={[
            {
              icon: FACogs,
              trans: m.app.Tooltips.edit,
              to: `/identity/${params.id}/edit`
            },
            {
              icon: FATrashO,
              trans: m.app.Tooltips.deleteItemName,
              onClick: this._confirmTrashIdentity,
              small: true
            }
          ]}
        />
        { this._renderBody() }
        { showConfirmDelete && confirmDeleteModal }
        <DetailBottomToolbar
          isGTMdScreen={isGTMdScreen}
          options={[
            {icon: FACogs, to: `/identity/${params.id}/edit`},
            {icon: FATrash, onClick: this._confirmTrashIdentity},
            {icon: FAEnvelope}
          ]}
        />
      </div>
    )
  }
}

const mapDispatchToProps = {
  identityRemove: Actions.identityRemove,
  heatmapRequest: Actions.heatmapRequest,
  cryptoRequest: Actions.cryptoRequest,
  setIterationIds: Actions.identitySetIterationIds,
  clearIterationIds: Actions.identityClearIterationIds,
}

const mapStateToProps = (state, ownProps) => {
  const data =
    path(['identity', 'searchResultsData', ownProps.params.id], state) ||
    path(['identity', 'data', ownProps.params.id], state)

  return {
    isListDataAvailable: !!(state.identity.data || state.identity.searchResultsData),
    data: data,
    nextId: state.identity.nextId,
    prevId: state.identity.prevId,
    isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
    timezone: state.user.data.timezone,
    avatarImage: data && path(['avatar', 'emails', data.email], state)
  }
}

const IntlInjected = injectIntl(_IdentityDetail)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
