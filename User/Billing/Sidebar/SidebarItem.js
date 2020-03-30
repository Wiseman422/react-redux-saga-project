import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const SidebarItem = ({ active, children, Icon, ...props }) =>
  <div
    className={classNames({
      'sidebar__item': true,
      'active': active
    })}
    {...props}
  >
    <Icon className='sidebar__item__icon' />
    <a className='sidebar__item__text'>
      {children}
    </a>
  </div>

SidebarItem.propTypes = {
  children: PropTypes.any,
  active: PropTypes.bool,
  Icon: PropTypes.any
}

export default SidebarItem
