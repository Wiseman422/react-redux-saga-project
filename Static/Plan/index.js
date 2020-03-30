import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'
import { injectIntl, intlShape } from 'react-intl'
import { Helmet } from 'react-helmet'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import PlanTable from 'app/Components/PlanTable'

import Footer from 'app/Components/Footer/HomepageFooter'

class Plan extends Component {
  static propTypes = {
    isGTSmScreen: PropTypes.bool,
    isGTMdScreen: PropTypes.bool,
    intl: intlShape
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.HOME)
  }

  render () {
    const { isGTSmScreen, isGTMdScreen } = this.props
    const fm = this.props.intl.formatMessage
    return (
      <div className={`homepage planpage blue-gradient-bg ${!isGTSmScreen && 'homepage__mobile'}`}>
        <div className='blue-gradient-bg-bottom' />
        <Helmet>
          <title>{fm(m.app.Home.title)}</title>
          <meta name='description' content={fm(m.app.Home.metaDescription)} />
          <meta name='keywords' content={fm(m.app.Home.metaKeywords)} />
          <meta name='og:title' content={fm(m.app.Home.metaOgTitle)} />
          <meta name='og:description' content={fm(m.app.Home.metaOgDescription)} />
          <meta name='og:site_name' content='MsgSafe.io' />
          <meta name='og:url' content='https://www.msgsafe.io' />
          <meta name='twitter:title' content={fm(m.app.Home.metaTwitterTitle)} />
          <meta name='twitter:description' content={fm(m.app.Home.metaTwitterDescription)} />
        </Helmet>
        <PlanTable />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  isGTMdScreen: path(['browser', 'greaterThan', 'md'], state)
})

const IntlInjectedPlan = injectIntl(Plan)

const CPlan = connect(mapStateToProps)(IntlInjectedPlan)

export const PlanRoute = {
  path: '/plans',
  component: CPlan
}
