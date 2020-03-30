import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import ax from 'commons/Services/Analytics/index'
import { path } from 'ramda'
import TableOfContents, { toc } from './TableOfContents'
import TableOfContentsSelector from './TableOfContentsSelector'
import BenefitsHeader from './BenefitsHeader'
import BenefitsIndex from './pages/Benefits'
import Footer from 'app/Components/Footer/HomepageFooter'
import MarketingAppLink from '../components/MarketingAppLink/'

export class Benefits extends Component {

  static propTypes = {
    children: PropTypes.any,
    isSmallScreen: PropTypes.bool
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.BENEFITS)
  }

  render () {
    const { isSmallScreen } = this.props
    return (
      <div className='blue-gradient-bg benefits__page'>
        <div className='blue-gradient-bg-bottom' />
        <BenefitsHeader />
        <div className='benefits'>
          <div className='benefits__top' id='benefits_top' />
          { isSmallScreen && <TableOfContents /> }
          { /* <TableOfContentsSelector /> */ }
          {this.props.children}
          { !isSmallScreen && <TableOfContents /> }
        </div>
        <div className='benefits__marketing_app_link blue-gradient-bg'>
          <div className='grey-gradient-top' />
          <MarketingAppLink />
        </div>
        <Footer />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isSmallScreen: path(['browser', 'lessThan', 'md'], state)
})

const BenfitsComponent = connect(mapStateToProps)(injectIntl(Benefits))

export const BenefitsRoute = {
  path: '/benefits',
  components: { children: BenfitsComponent, hideFooter: true },
  childRoutes: toc,
  indexRoute: {
    component: BenefitsIndex
  }
}
