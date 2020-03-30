import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { push as Menu } from 'react-burger-menu'

import DrawerActions, { isMailboxDrawerOpen } from 'app/Redux/DrawerRedux'

import Sidebar from './'

const MailboxDrawer = props => (
  <Menu
    width={250}
    customBurgerIcon={false}
    customCrossIcon={false}
    pageWrapId='core-layout__content'
    outerContainerId='core-layout'
    onStateChange={state => props.setMailboxDrawerVisibility(state.isOpen)}
    isOpen={props.isOpen}
  >
    <Sidebar intl={props.intl} />
  </Menu>
)

MailboxDrawer.propTypes = {
  isOpen: PropTypes.bool,
  setMailboxDrawerVisibility: PropTypes.func,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  isOpen: isMailboxDrawerOpen(state)
})

const mapDispatchToProps = {
  setMailboxDrawerVisibility: DrawerActions.setMailboxDrawerVisibility
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MailboxDrawer))
