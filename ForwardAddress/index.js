import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'

import ResponsiveContainer from 'app/Components/ResponsiveContainer'
import HelmetTitle from 'app/Components/HelmetTitle'

import ForwardAddressDetail from './Detail/'
import ForwardAddressEdit from './Edit/'
import ForwardAddressSidebar from './List/components/Sidebar/'
import ForwardAddressList from './List/'

class _ForwardAddress extends Component {
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
        identifier='forwardAddress'
        isMediumScreen={isMediumScreen}
        isLargeScreen={isLargeScreen}
        editComponent={ForwardAddressEdit}
        detailComponent={ForwardAddressDetail}
        sidebarComponent={ForwardAddressSidebar}
        params={params}
        noneSelectedMessage={intl.formatMessage(m.app.ForwardAddress.pleaseSelectAForwardAddress)}
      >
        <HelmetTitle titleTrans={m.app.ForwardAddress.forwardAddresses} />
        <ForwardAddressList params={params} />
      </ResponsiveContainer>
    )
  }
}

const mapStateToProps = state => ({
  isMediumScreen: path(['browser', 'greaterThan', 'sm'], state),
  isLargeScreen: path(['browser', 'greaterThan', 'md'], state)
})

export const ForwardAddress = connect(mapStateToProps)(injectIntl(_ForwardAddress))
export const ForwardAddressRoute = {
  component: ForwardAddress,
  path: '/esp',
  childRoutes: [
    { path: ':id' },
    { path: ':id/:action' }
  ]
}
