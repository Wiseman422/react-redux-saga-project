import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { push as Menu } from 'react-burger-menu'

import DrawerActions, { isBillingDrawerOpen } from 'app/Redux/DrawerRedux'

import Sidebar from './'

const BillingDrawer = props => (
  <Menu
    width={250}
    customBurgerIcon={false}
    customCrossIcon={false}
    pageWrapId='core-layout__content'
    outerContainerId='core-layout'
    onStateChange={state => props.setBillingDrawerVisibility(state.isOpen)}
    isOpen={props.isOpen}
  >
    <Sidebar intl={props.intl} />
  </Menu>
)

BillingDrawer.propTypes = {
  isOpen: PropTypes.bool,
  setBillingDrawerVisibility: PropTypes.func,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  isOpen: isBillingDrawerOpen(state)
})

const mapDispatchToProps = {
  setBillingDrawerVisibility: DrawerActions.setBillingDrawerVisibility
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(BillingDrawer))
