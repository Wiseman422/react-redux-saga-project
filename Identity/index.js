import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'
import { intlShape, injectIntl } from 'react-intl'

import ResponsiveContainer from 'app/Components/ResponsiveContainer'
import HelmetTitle from 'app/Components/HelmetTitle'

import m from 'commons/I18n/'

import IdentityDetail from './Detail/'
import IdentityEdit from './Edit/'
import IdentitySidebar from './List/components/Sidebar/'
import IdentityList from './List/'

class _Identity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isMediumScreen: PropTypes.bool,
    isLargeScreen: PropTypes.bool,
    params: PropTypes.object,
  }

  render () {
    const { isMediumScreen, isLargeScreen, params, intl } = this.props

    return (
      <ResponsiveContainer
        identifier='identity'
        isMediumScreen={isMediumScreen}
        isLargeScreen={isLargeScreen}
        detailComponent={IdentityDetail}
        sidebarComponent={IdentitySidebar}
        editComponent={IdentityEdit}
        params={params}
        noneSelectedMessage={intl.formatMessage(m.app.Identity.pleaseSelectAMailbox)}
      >
        <HelmetTitle titleTrans={m.app.Identity.listTitle} />
        <IdentityList params={params} />
      </ResponsiveContainer>
    )
  }
}

const mapStateToProps = state => ({
  isMediumScreen: path(['browser', 'greaterThan', 'sm'], state),
  isLargeScreen: path(['browser', 'greaterThan', 'md'], state)
})

export const Identity = connect(mapStateToProps)(injectIntl(_Identity))
export const IdentityRoute = {
  component: Identity,
  path: '/identity',
  childRoutes: [
    { path: ':id' },
    { path: ':id/:action' }
  ]
}
