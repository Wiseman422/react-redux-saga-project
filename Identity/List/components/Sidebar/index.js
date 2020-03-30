import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FAPlus from 'react-icons/lib/fa/plus'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import IdentityActions from 'commons/Redux/IdentityRedux'
import { SidebarButton, SidebarSort } from 'app/Components/Sidebar'

import m from 'commons/I18n/'

class IdentityDrawer extends Component {
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
        orderBy: 'identity_last_activity_on',
        defaultSortBy: 'desc',
        sortByTitle: {
          asc: fm(m.app.Common.oldest),
          desc: fm(m.app.Common.newest)
        }
      },
      {
        title: fm(m.app.Common.name),
        orderBy: 'identity_display_name',
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
          to='/identity/new'
        />
        <SidebarSort
          sortData={this._sortData}
          defaultSortByTitle={this._defaultSortByTitle}
          orderBy={this.props.orderBy}
          sortBy={this.props.sortBy}
          setSortOrder={this.props.setSortOrder}
          defaultOrderBy='identity_last_activity_on'
          defaultSortBy='desc'
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  orderBy: state.identity.orderBy,
  sortBy: state.identity.sortBy
})

const mapDispatchToProps = {
  setSortOrder: IdentityActions.identitySetSortOrder
}
const IntlInjected = injectIntl(IdentityDrawer)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
