import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push as Menu } from 'react-burger-menu'

import DrawerActions, { isIdentityDrawerOpen } from 'app/Redux/DrawerRedux'

import Sidebar from './'

const IdentityDrawer = props => (
  <Menu
    width={250}
    customBurgerIcon={false}
    customCrossIcon={false}
    pageWrapId='core-layout__content'
    outerContainerId='core-layout'
    onStateChange={state => props.setIdentityDrawerVisibility(state.isOpen)}
    isOpen={props.isOpen}
  >
    <Sidebar />
  </Menu>
)

IdentityDrawer.propTypes = {
  isOpen: PropTypes.bool,
  setIdentityDrawerVisibility: PropTypes.func
}

const mapStateToProps = state => ({
  isOpen: isIdentityDrawerOpen(state)
})

const mapDispatchToProps = {
  setIdentityDrawerVisibility: DrawerActions.setIdentityDrawerVisibility
}

export default connect(mapStateToProps, mapDispatchToProps)(IdentityDrawer)
