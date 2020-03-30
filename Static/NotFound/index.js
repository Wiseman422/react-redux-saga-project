import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { path } from 'ramda'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'

import PlanTable from 'app/Components/PlanTable'

import MarketingHeader from '../components/MarketingHeader/'
import MarketingScreenshots from '../components/MarketingScreenshots/'

export class NotFound extends Component {
  static propTypes = {
    isGTSmScreen: PropTypes.bool
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.NOT_FOUND)
  }

  render () {
    return (
      <div>
        <MarketingHeader />
        <div className='app__not-found'>
          <h2><FormattedMessage {...m.app.Misc.notFoundMessage} /></h2>
          <h3><FormattedMessage {...m.app.Misc.errorCode404} /></h3>
        </div>
        <MarketingScreenshots isGTSmScreen={this.props.isGTSmScreen} />
        <PlanTable />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state)
})

const CNotFound = connect(mapStateToProps)(NotFound)

export const NotFoundRoute = {
  'path': '*',
  component: CNotFound
}
