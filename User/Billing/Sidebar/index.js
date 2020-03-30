import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { withRouter } from 'react-router'

import history from 'app/Routes/History'
import m from 'commons/I18n/'

import { SidebarHeader } from 'app/Components/Sidebar/'
import SidebarItem from './SidebarItem'
import FAHistory from 'react-icons/lib/fa/history'
import FACard from 'react-icons/lib/fa/credit-card'

const _BillingSidebar = (props) => {
  const pathname = props.location.pathname
  const { intl } = props
  return (
    <div>
      <SidebarHeader>
        {intl.formatMessage(m.app.Billing.billing)}
      </SidebarHeader>
      <SidebarItem
        Icon={FAHistory}
        active={pathname === '/billing/history'}
        onClick={() => history.push('/billing/history')}
      >
        {intl.formatMessage(m.app.Billing.history)}
      </SidebarItem>
      <SidebarItem
        Icon={FACard}
        active={pathname === '/billing/methods'}
        onClick={() => history.push('/billing/methods')}
      >
        {intl.formatMessage(m.app.Billing.methods)}
      </SidebarItem>
    </div>
  )
}

_BillingSidebar.propTypes = {
  intl: intlShape.isRequired,
  location: PropTypes.object
}

const IntlInjected = injectIntl(_BillingSidebar)

export default withRouter(IntlInjected)
