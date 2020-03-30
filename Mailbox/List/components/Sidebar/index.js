import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import FAInbox from 'react-icons/lib/fa/inbox'
import FASent from 'react-icons/lib/fa/paper-plane-o'
import FAForward from 'react-icons/lib/fa/mail-forward'
import FAArchive from 'react-icons/lib/fa/archive'
import FATrash from 'react-icons/lib/fa/trash-o'
import FAHourGlass from 'react-icons/lib/fa/hourglass-1'

import m from 'commons/I18n/'
import MailboxActions from 'commons/Redux/MailboxRedux'
import log from 'commons/Services/Log'

import DrawerActions from 'app/Redux/DrawerRedux'
import { SidebarHeader, SidebarBaseFilters, SidebarRelationFilters } from 'app/Components/Sidebar/'

class MailboxDrawer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    totals: PropTypes.object,
    className: PropTypes.string,
    filterName: PropTypes.string,
    setMailboxFilter: PropTypes.func.isRequired,
    clearMailboxFilter: PropTypes.func.isRequired,
    filterIdentityIds: PropTypes.array,
    filterDomainIds: PropTypes.array,
    clearMailboxIdentityFilter: PropTypes.func,
    clearMailboxDomainFilter: PropTypes.func,
    clearAllMailboxRelationFilters: PropTypes.func,

    openMailboxFilterIdentitySelectionDrawer: PropTypes.func,
    openMailboxFilterDomainSelectionDrawer: PropTypes.func
  }

  constructor (props) {
    super(props)
    this._getBaseFilters = this._getBaseFilters.bind(this)
  }

  _getBaseFilters () {
    const { props } = this
    const { totals } = props
    const fm = props.intl.formatMessage

    let baseFiltersData = [
      {
        text: fm(m.app.Mailbox.inbox),
        key: null,
        icon: FAInbox,
        onPress: props.clearMailboxFilter,
        info: (totals.total_is_unread > 0) ? totals.total_is_unread - totals.total_is_unread_trash : null
      },
      {
        text: fm(m.app.Mailbox.sent),
        key: 'sent',
        icon: FASent,
        onPress: props.setMailboxFilter.bind(null, 'sent'),
        info: (totals.total_is_sent > 0) ? totals.total_is_sent : null
      },
      {
        text: fm(m.app.Mailbox.forwarded),
        key: 'forwarded',
        icon: FAForward,
        onPress: props.setMailboxFilter.bind(null, 'forwarded'),
        info: (totals.total_is_forward > 0) ? totals.total_is_forward : null
      },
      {
        text: fm(m.app.Mailbox.archive),
        key: 'archive',
        icon: FAArchive,
        onPress: props.setMailboxFilter.bind(null, 'archive'),
        info: (totals.total_is_archive > 0) ? totals.total_is_archive : null
      },
      {
        text: fm(m.app.Mailbox.trash),
        key: 'trash',
        icon: FATrash,
        onPress: props.setMailboxFilter.bind(null, 'trash'),
        info: (totals.total_is_trash > 0) ? totals.total_is_trash : null
      }
    ]

    if (totals.total_is_2factor) {
      baseFiltersData.push(
        {
          text: fm(m.app.Mailbox.queued),
          key: 'queued',
          icon: FAHourGlass,
          onPress: this.props.setMailboxFilter.bind(null, 'queued'),
          info: totals.total_is_2factor
        }
      )
    }
    return baseFiltersData
  }

  render () {
    const { intl } = this.props

    let currentBaseFilters = this._getBaseFilters()
    const filters = [
      {
        title: intl.formatMessage(m.app.Mailbox.mailboxes),
        onClick: this.props.openMailboxFilterIdentitySelectionDrawer,
        count: (this.props.filterIdentityIds || []).length,
        clear: this.props.clearMailboxIdentityFilter
      },
      {
        title: intl.formatMessage(m.app.Domain.domains),
        onClick: this.props.openMailboxFilterDomainSelectionDrawer,
        count: (this.props.filterDomainIds || []).length,
        clear: this.props.clearMailboxDomainFilter
      }
    ]

    return (
      <div className={this.props.className}>
        <SidebarHeader><FormattedMessage {...m.app.Common.selectFolder} /></SidebarHeader>
        <SidebarBaseFilters
          activeFilter={this.props.filterName}
          filters={currentBaseFilters}
        />
        <SidebarRelationFilters
          filters={filters}
          clearAllFilters={this.props.clearAllMailboxRelationFilters}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  filterName: state.mailbox.filterName,
  filterIdentityIds: state.mailbox.filterIdentityIds,
  filterDomainIds: state.mailbox.filterDomainIds,
  totals: state.mailbox.drawerTotals || {}
})

const mapDispatchToProps = {
  setMailboxFilter: MailboxActions.setMailboxFilter,
  clearMailboxFilter: MailboxActions.clearMailboxFilter,
  clearMailboxIdentityFilter: MailboxActions.clearMailboxIdentityFilter,
  clearMailboxDomainFilter: MailboxActions.clearMailboxDomainFilter,
  clearAllMailboxRelationFilters: MailboxActions.clearAllMailboxRelationFilters,
  openMailboxFilterIdentitySelectionDrawer: DrawerActions.openMailboxFilterIdentitySelectionDrawer,
  openMailboxFilterDomainSelectionDrawer: DrawerActions.openMailboxFilterDomainSelectionDrawer
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MailboxDrawer))
