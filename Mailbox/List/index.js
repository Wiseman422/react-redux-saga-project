import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Link from 'react-router/lib/Link'
import { path } from 'ramda'
import classNames from 'classnames'
import FABars from 'react-icons/lib/fa/bars'
import FaEnvelope from 'react-icons/lib/fa/envelope'
import FAUnread from 'react-icons/lib/fa/align-center'
import FAPencil from 'react-icons/lib/fa/pencil'
import FATrash from 'react-icons/lib/fa/trash'
import FALock from 'react-icons/lib/fa/lock'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import FlagIcon from 'react-flag-kit/lib/FlagIcon'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import { timeAgo } from 'commons/Lib/Utils'
import MailboxActions from 'commons/Redux/MailboxRedux'
import { getCommonListReduxValues, commonListReduxValueProps } from 'commons/Redux/_Utils'
import { isPendingOnboard } from 'commons/Selectors/User'
import { isAnyMailboxFilterActive } from 'commons/Selectors/Mailbox'
import log from 'commons/Services/Log'

import Button from 'app/Components/Button'
import history from 'app/Routes/History'
import DrawerActions from 'app/Redux/DrawerRedux'
import ListView from 'app/Components/ListView'
import EmptyList from 'app/Components/ListView/components/EmptyList'
import ResponsiveContainer from 'app/Components/ResponsiveContainer'
import IconTooltip from 'app/Components/IconTooltip'
import ConfirmDialog from 'app/Components/ConfirmDialog'
import HelmetTitle from 'app/Components/HelmetTitle'

import { MailboxDetail } from '../Detail/'
import MailboxSidebar from './components/Sidebar/'
import MailboxSort from './components/Sort'

class _MailboxList extends Component {
  static propTypes = {
    filterName: PropTypes.string,
    fetchData: PropTypes.func,
    clearSearchResultsData: PropTypes.func,
    setSearchQuery: PropTypes.func,
    openMailboxDrawer: PropTypes.func,
    isGTSmScreen: PropTypes.bool,
    isGTMdScreen: PropTypes.bool,
    intl: intlShape.isRequired,
    isPendingOnboard: PropTypes.bool,
    timezone: PropTypes.string,
    ...commonListReduxValueProps
  }

  constructor (props) {
    super(props)

    this._toggleSidebar = this._toggleSidebar.bind(this)
    this._showClearTrashDialog = this._showClearTrashDialog.bind(this)
    this._hideClearTrashDialog = this._hideClearTrashDialog.bind(this)
    this._renderElement = this._renderElement.bind(this)

    this.state = {
      clearTrashDialogVisible: false
    }
  }

  componentWillMount () {
    if (this.props.isPendingOnboard) {
      history.push('/identity/new')
    }
  }

  componentDidMount () {
    // Open first item if on large screen
    if (
      this.props.params && !this.props.params.id &&
      this.props.isGTMdScreen &&
      this.props.dataOrder && this.props.dataOrder[0]
    ) {
      history.push(`/mailbox/${this.props.dataOrder[0]}`)
      return
    }

    ax.listPageView(ax.EVENTS.MAILBOX)
  }

  componentWillReceiveProps (nextProps) {
    // Open first item if on large screen
    if (nextProps.params && !nextProps.params.id && nextProps.isGTMdScreen && !this.props.dataOrder && nextProps.dataOrder && nextProps.dataOrder[0]) {
      history.push(`/mailbox/${nextProps.dataOrder[0]}`)
    }
  }

  _showClearTrashDialog () {
    log.debug('_showClearTrashDialog')
    this.setState({clearTrashDialogVisible: true})
  }

  _hideClearTrashDialog () {
    this.setState({clearTrashDialogVisible: false})
  }

  _toggleSidebar () {
    this.refs.responsiveContainer && this.refs.responsiveContainer.toggleSidebar()
  }

  _renderElement (data, params, intl) {
    const classes = classNames({
      'list-item': true,
      'list-item--mailbox': true,
      'list-item--mailbox-unread': !data.is_read,
      'active': params && params.id && parseInt(params.id) === data.id
    })

    const isEncrypted = data.is_pgp_out || data.is_pgp_in || data.is_smime_out || data.is_smime_in
    let encryptionMessage
    if (
      ((data.is_pgp_out && data.is_smime_out) || (data.is_pgp_in && data.is_smime_in))
    ) {
      encryptionMessage = m.app.Mailbox.gpgSmimeEncrypted
    } else if (data.is_pgp_out || data.is_pgp_in) {
      encryptionMessage = m.app.Mailbox.gpgEncrypted
    } else if (data.is_smime_out || data.is_smime_in) {
      encryptionMessage = m.app.Mailbox.smimeEncrypted
    }

    return (
      <Link className={classes} key={data.id} to={`/mailbox/${data.id}`}>
        <div className='list-item__timestamp'>{timeAgo(data.created_on, intl, this.props.timezone)}</div>
        <div className='list-item__from-name'>
          { data.msg_from_displayname }
        </div>
        <div className='list-item__subject'>{data.msg_subject}</div>
        { isEncrypted && (
          <span className='list-item__lock'><IconTooltip placement='left' icon={FALock} trans={encryptionMessage} transValues={{smime: 'S/MIME', gpg: 'GPG'}} /></span>
        )}
        { data.inbound_region && <FlagIcon className='list-item__flag' code={data.inbound_region} /> }
      </Link>
    )
  }

  _renderEmptyList () {
    return (
      <EmptyList icon={<FaEnvelope size='60' />}>
        <p>
          <FormattedMessage {...m.app.Mailbox.emptyList} />
        </p>
        <Link to='/mailbox/new'>
        <Button btnStyle='success' type='button'>
          <FormattedMessage {...m.app.Mailbox.sendMessage } />
        </Button>
        </Link>
      </EmptyList>
    )
  }

  _renderLeftToolbarItems () {
    const { filterName, searchResultsDataOrder } = this.props

    if (!(
      searchResultsDataOrder &&
      searchResultsDataOrder.length &&
      filterName && filterName.toLowerCase() === 'trash'
    )) return null

    return [(
      <div
        className='page-header__toolbar__button'
        key='empty-trash'
        onClick={this._showClearTrashDialog}
      >
        <IconTooltip placement='bottom' icon={FATrash} trans={m.app.Mailbox.emptyTrash} />
      </div>
    )]
  }

  render () {
    const { filterName, toggleUnreadFilter, unreadOnlyFilter, isGTSmScreen, isGTMdScreen, params, intl } = this.props
    const bottomToolbarLeftItems = [
      <div title={intl.formatMessage(m.app.Mailbox.filterByUnreadMessages)} className={classNames({
        'toolbar__option': true,
        'toolbar__option--icon': true,
        'active': unreadOnlyFilter
      })} onClick={toggleUnreadFilter} key='unread'>
        <FAUnread />
      </div>
    ]

    const bottomToolbarRightItems = [
      <Link
        title={intl.formatMessage(m.app.Mailbox.composeANewMessage)}
        className='toolbar__option toolbar__option--icon'
        to='/mailbox/new'
        key='compose'
      >
        <FAPencil />
      </Link>
    ]

    const titleTrans = m.app.Mailbox[filterName || 'inbox']

    return (
      <ResponsiveContainer
        ref='responsiveContainer'
        identifier='mailbox'
        isMediumScreen={isGTSmScreen}
        isLargeScreen={isGTMdScreen}
        params={params}
        detailComponent={MailboxDetail}
        sidebarComponent={MailboxSidebar}
        editViewActions={['reply', 'forward']}
        noneSelectedMessage={intl.formatMessage(m.app.Mailbox.selectAnEmail)}
      >
        <HelmetTitle titleTrans={titleTrans} />
        <ConfirmDialog
          bodyText={intl.formatMessage(m.app.Mailbox.clearTrashConfirmationMessage)}
          cancelButtonText={intl.formatMessage(m.app.Common.cancel)}
          confirmButtonText={intl.formatMessage(m.app.Mailbox.emptyTrash)}
          confirmHandler={this.props.clearTrash}
          cancelHandler={this._hideClearTrashDialog}
          dialogButton={<span />}
          isOpened={this.state.clearTrashDialogVisible}
        />
        <ListView
          intl={intl}
          title={intl.formatMessage(titleTrans)}
          titleIcon={!isGTSmScreen ? FABars : null}
          titleOnClick={!isGTSmScreen ? this.props.openMailboxDrawer : null}
          renderElement={this._renderElement}
          elementHeight={73}
          bottomToolbarHeight={47}
          renderEmptyList={this._renderEmptyList}
          bottomToolbarLeftItems={bottomToolbarLeftItems}
          bottomToolbarRightItems={bottomToolbarRightItems}
          sortComponent={MailboxSort}
          showFilterIcon
          isFilterIconActive={this.props.isAnyMailboxFilterActive}
          onFilterIconClick={this._toggleSidebar}
          leftToolbarItems={this._renderLeftToolbarItems()}
          {...this.props}
        />
      </ResponsiveContainer>
    )
  }
}

const mapStateToProps = state => ({
  ...getCommonListReduxValues(state, 'mailbox'),
  isPendingOnboard: isPendingOnboard(state),
  filterName: state.mailbox.filterName,
  unreadOnlyFilter: state.mailbox.unreadOnlyFilter,
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
  isAnyMailboxFilterActive: isAnyMailboxFilterActive(state),
  timezone: state.user.data.timezone
})

const mapDispatchToProps = {
  fetchData: MailboxActions.mailboxFetch,
  clearSearchResultsData: MailboxActions.mailboxClearSearchData,
  setSearchQuery: MailboxActions.mailboxSetSearchQuery,
  toggleUnreadFilter: MailboxActions.toggleUnreadFilter,
  clearTrash: MailboxActions.mailboxClearTrashRequest,
  openMailboxDrawer: DrawerActions.openMailboxDrawer
}

const IntlInjected = injectIntl(_MailboxList)
export const MailboxList = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
export const MailboxListRoute = {
  component: MailboxList,
  path: '/mailbox',
  childRoutes: [
    { path: '/mailbox/:id' }
  ]
}
