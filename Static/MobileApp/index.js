import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ax from 'commons/Services/Analytics/index'
import PageHeader from './components/PageHeader'
import PageFooter from './components/PageFooter'
import ProductFeatures from './components/ProductFeatures'
import ProductBenefits from './components/ProductBenefits'

export class MobileApp extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.MARKETING)
  }

  render () {
    return (
      <div className='mktpage'>
        <PageHeader />
        <ProductFeatures />
        <ProductBenefits />
        <PageFooter />
      </div>
    )
  }
}

export const MobileAppRoute = {
  path: '/mobileapp',
  component: MobileApp
}
