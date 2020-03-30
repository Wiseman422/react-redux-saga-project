import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FAPlus from 'react-icons/lib/fa/plus'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { SidebarButton, SidebarSort } from 'app/Components/Sidebar'

import m from 'commons/I18n/'


class ForwardAddressDrawer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    orderBy: PropTypes.string,
    sortBy: PropTypes.string,
    className: PropTypes.string,
    setSortOrder: PropTypes.func
  }
  constructor (props) {
    super(props)

    const fm = props.intl.formatMessage

    this._defaultSortByTitle = {
      asc: fm(m.app.Common.ascending),
      desc: fm(m.app.Common.descending)
    }

    this._sortData = [
      {
        title: fm(m.app.Common.active),
        orderBy: 'last_activity_on',
        defaultSortBy: 'desc',
        sortByTitle: {
          asc: fm(m.app.Common.oldest),
          desc: fm(m.app.Common.newest)
        }
      },
      {
        title: fm(m.app.Common.name),
        orderBy: 'display_name',
        defaultSortBy: 'asc'
      }
    ]
  }

  render () {
    const { intl } = this.props

    return (
      <div className={this.props.className}>
        <SidebarButton
          text={intl.formatMessage(m.app.Common.add)}
          icon={FAPlus}
          to='/esp/new'
        />
        <SidebarSort
          sortData={this._sortData}
          defaultSortByTitle={this._defaultSortByTitle}
          orderBy={this.props.orderBy}
          sortBy={this.props.sortBy}
          setSortOrder={this.props.setSortOrder}
          defaultOrderBy='last_activity_on'
          defaultSortBy='desc'
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  orderBy: state.useremail.orderBy,
  sortBy: state.useremail.sortBy
})

const mapDispatchToProps = {
  setSortOrder: UserEmailActions.useremailSetSortOrder
}

const IntlInjected = injectIntl(ForwardAddressDrawer)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
