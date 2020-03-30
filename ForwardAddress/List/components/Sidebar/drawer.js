import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push as Menu } from 'react-burger-menu'

import DrawerActions, { isForwardAddressDrawerOpen } from 'app/Redux/DrawerRedux'

import Sidebar from './'
const ForwardAddressDrawer = props => (
  <Menu
    width={250}
    customBurgerIcon={false}
    customCrossIcon={false}
    pageWrapId='core-layout__content'
    outerContainerId='core-layout'
    isOpen={props.isOpen}
    onStateChange={state => props.setForwardAddressDrawerVisibility(state.isOpen)}
  >
    <Sidebar />
  </Menu>
)

ForwardAddressDrawer.propTypes = {
  isOpen: PropTypes.bool,
  setForwardAddressDrawerVisibility: PropTypes.func
}

const mapStateToProps = state => ({
  isOpen: isForwardAddressDrawerOpen(state)
})

const mapDispatchToProps = {
  setForwardAddressDrawerVisibility: DrawerActions.setForwardAddressDrawerVisibility
}

export default connect(mapStateToProps, mapDispatchToProps)(ForwardAddressDrawer)
