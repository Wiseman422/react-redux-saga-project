import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import IdentityActions from 'commons/Redux/IdentityRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'
import ContactActions from 'commons/Redux/ContactRedux'

import Drawer from 'app/Components/Drawer'
import DrawerActions, {
  isMailboxFilterIdentitySelectionDrawerOpen,
  isContactFilterIdentitySelectionDrawerOpen
} from 'app/Redux/DrawerRedux'
import IdentityList from 'app/Containers/Identity/List'

/**
 * Mailbox Identity filter selection drawer.
 */
class _FilterIdentitySelectionDrawer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    identityData: PropTypes.object,
    filterIdentityIds: PropTypes.array,
    fetchIdentities: PropTypes.func.isRequired,

    toggleIdentityFilter: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,

    isOpen: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._fetchData = this._fetchData.bind(this)
  }

  _fetchData () {
    !this.props.identityData && this.props.fetchIdentities()
  }

  render () {
    return (
      <div className='drawer-high-z-index'>
        <Drawer
          ref='drawer'
          dismiss={this.props.closeDrawer}
          onDrawerOpen={this._fetchData}
          {...this.props}
        >
          <IdentityList
            title={this.props.intl.formatMessage(m.app.Mailbox.selectMailboxes)}
            smallHeader
            enableItemSelection
            toggleItemSelection={this.props.toggleIdentityFilter}
            selectedItemIDs={this.props.filterIdentityIds}
            onItemSelectionDone={this.props.closeDrawer}
          />
        </Drawer>
      </div>
    )
  }
}

const FilterIdentitySelectionDrawer = injectIntl(_FilterIdentitySelectionDrawer)

export const MailboxIdentitySelectionDrawer = connect(state => ({
  identityData: state.identity.data,
  filterIdentityIds: state.mailbox.filterIdentityIds,
  isOpen: isMailboxFilterIdentitySelectionDrawerOpen(state),
}), {
  fetchIdentities: IdentityActions.identityFetch,
  toggleIdentityFilter: MailboxActions.toggleMailboxIdentityFilter,
  closeDrawer: DrawerActions.closeMailboxFilterIdentitySelectionDrawer
})(FilterIdentitySelectionDrawer)

export const ContactIdentitySelectionDrawer = connect(state => ({
  identityData: state.identity.data,
  filterIdentityIds: state.contact.filterIdentityIds,
  isOpen: isContactFilterIdentitySelectionDrawerOpen(state),
}), {
  fetchIdentities: IdentityActions.identityFetch,
  toggleIdentityFilter: ContactActions.toggleContactIdentityFilter,
  closeDrawer: DrawerActions.closeContactFilterIdentitySelectionDrawer
})(FilterIdentitySelectionDrawer)
