import React from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import m from 'commons/I18n/'
import MailboxActions from 'commons/Redux/MailboxRedux'

import { SidebarSort } from 'app/Components/Sidebar/'

const MailboxSort = props => {
  const fm = props.intl.formatMessage

  const _sortData = [
    {
      title: fm(m.app.Common.date),
      orderBy: 'id',
      defaultSortBy: 'desc',
      sortByTitle: {
        asc: fm(m.app.Common.oldest),
        desc: fm(m.app.Common.newest)
      }
    },
    {
      title: fm(m.app.Mailbox.mailbox),
      orderBy: 'msg_to',
      defaultSortBy: 'asc'
    },
    {
      title: fm(m.app.Mailbox.sender),
      orderBy: 'msg_from',
      defaultSortBy: 'asc'
    },
    {
      title: fm(m.app.Mailbox.subject),
      orderBy: 'msg_subject',
      defaultSortBy: 'asc'
    },
    {
      title: fm(m.app.Common.region),
      orderBy: 'inbound_region',
      defaultSortBy: 'asc'
    }
  ]

  const defaultSortByTitle = {
    asc: fm(m.app.Common.ascending),
    desc: fm(m.app.Common.descending)
  }

  return (
    <SidebarSort
      sortData={_sortData}
      defaultSortByTitle={defaultSortByTitle}
      orderBy={props.orderBy}
      sortBy={props.sortBy}
      setSortOrder={props.setSortOrder}
      defaultOrderBy='id'
      defaultSortBy='desc'
    />
  )
}

MailboxSort.propTypes = {
  intl: intlShape.isRequired,
  orderBy: PropTypes.string,
  sortBy: PropTypes.string,
  setSortOrder: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => ({
  orderBy: state.mailbox.orderBy,
  sortBy: state.mailbox.sortBy
})

const mapDispatchToProps = {
  setSortOrder: MailboxActions.mailboxSetSortOrder
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MailboxSort))
