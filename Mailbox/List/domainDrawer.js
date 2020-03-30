import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import DomainActions from 'commons/Redux/MailboxDomainRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'

import Drawer from 'app/Components/Drawer'
import DrawerActions, { isMailboxFilterDomainSelectionDrawerOpen } from 'app/Redux/DrawerRedux'
import { DomainList } from 'app/Containers/Domain/List/mailboxDomains'

class _MailboxDomainSelectionDrawer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    domainData: PropTypes.object,
    filterDomainIds: PropTypes.array,
    toggleMailboxDomainFilter: PropTypes.func.isRequired,
    closeMailboxFilterDomainSelectionDrawer: PropTypes.func.isRequired
  }

  render () {
    return (
      <div className='drawer-high-z-index'>
        <Drawer
          ref={this.props.intl.formatMessage(m.app.Domain.selectDomains)}
          dismiss={this.props.closeMailboxFilterDomainSelectionDrawer}
          onDrawerOpen={this._fetchData}
          showAbove
          {...this.props}
        >
          <DomainList
            title='Select Domains'
            smallHeader
            enableItemSelection
            toggleItemSelection={this.props.toggleMailboxDomainFilter}
            onItemSelectionDone={this.props.closeMailboxFilterDomainSelectionDrawer}
            selectedItemIDs={this.props.filterDomainIds}
          />
        </Drawer>
      </div>
    )
  }
}

const MailboxDomainSelectionDrawer = injectIntl(_MailboxDomainSelectionDrawer)

const mapStateToProps = state => ({
  filterDomainIds: state.mailbox.filterDomainIds,
  domainData: state.mailboxDomain.data,
  isOpen: isMailboxFilterDomainSelectionDrawerOpen(state)
})

const mapDispatchToProps = {
  toggleMailboxDomainFilter: MailboxActions.toggleMailboxDomainFilter,
  closeMailboxFilterDomainSelectionDrawer: DrawerActions.closeMailboxFilterDomainSelectionDrawer
}

export default connect(mapStateToProps, mapDispatchToProps)(MailboxDomainSelectionDrawer)
