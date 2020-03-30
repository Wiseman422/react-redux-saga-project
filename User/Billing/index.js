import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'

import Container from './BillingContainer'
import Sidebar from './Sidebar/index'
import { PaymentHistoryList } from './PaymentHistory'
import PaymentMethods from './PaymentMethods'

export const _Billing = ({ isGTSmScreen, openBillingDrawer, children }) => {
  return (
    <Container
      identifier='billing'
      sidebarComponent={Sidebar}
      isMediumScreen={isGTSmScreen}
    >
      {children}
    </Container>
  )
}

_Billing.propTypes = {
  children: PropTypes.any,
  isGTSmScreen: PropTypes.bool,
  openBillingDrawer: PropTypes.func
}

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state)
})

const Billing = connect(mapStateToProps)(_Billing)

export const BillingRoute = {
  component: Billing,
  path: '/billing',
  childRoutes: [
    {
      path: '/billing/history',
      component: PaymentHistoryList
    },
    {
      path: '/billing/methods',
      component: PaymentMethods
    }
  ]
}
