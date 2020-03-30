import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { path } from 'ramda'
import classnames from 'classnames'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import MailboxActions from 'commons/Redux/MailboxRedux'

import { FullPageView } from 'app/Components/FullPageView'
import HelmetTitle from 'app/Components/HelmetTitle'

import MailboxDetailAnalyticsHops from './components/AnalyticsHops'
import MailboxDetailAnalyticsMap from './components/AnalyticsMap'

class _MailboxAnalytics extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object,
    analyticsRequest: PropTypes.func,
    embedded: PropTypes.bool
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.MAILBOX_PATH_ANALYZER)
  }

  componentWillMount () {
    if (!this.props.data.analytics) {
      this.props.analyticsRequest(this.props.data.id)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.data.analytics) {
      if (!nextProps.data.analyticsStatus || !nextProps.data.analyticsStatus.inProgress) {
        this.props.analyticsRequest(nextProps.data.id)
      }
    }
  }

  _renderContent () {
    if (!this.props.data.analytics) return null
    const { embedded } = this.props
    const wrapperClass = classnames({
      'mailbox-detail__analytics': true,
      'mailbox-detail__analytics__embedded': embedded
    })
    return (
      <div className={wrapperClass}>
        <div
          className={classnames({
            'mailbox-detail__analytics__div': true,
            'mailbox-detail__analytics__div__embedded': embedded
          })}
        >
          <MailboxDetailAnalyticsMap analytics={this.props.data.analytics} />
        </div>
        <div
          className={classnames({
            'mailbox-detail__analytics__div': true,
            'mailbox-detail__analytics__div__last': true,
            'mailbox-detail__analytics__div__embedded': embedded
          })}
        >
          <MailboxDetailAnalyticsHops intl={this.props.intl} data={this.props.data} />
        </div>
      </div>
    )
  }

  render () {
    if (this.props.embedded) return this._renderContent()

    const fm = this.props.intl.formatMessage
    return (
      <FullPageView title={fm(m.app.Mailbox.emailPathAnalyzer)}>
        <HelmetTitle titleTrans={m.app.Mailbox.emailPathAnalyzer} />
        { this._renderContent() }
      </FullPageView>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const data =
    path(['mailbox', 'searchResultsData', ownProps.params.id], state) ||
    path(['mailbox', 'data', ownProps.params.id], state)

  return {
    data: data
  }
}

const mapDispatchToProps = {
  analyticsRequest: MailboxActions.mailboxAnalyticsRequest
}

const IntlInjected = injectIntl(_MailboxAnalytics)
export const MailboxAnalytics = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const MailboxAnalyticsRoute = {
  components: { children: MailboxAnalytics, hideNav: 'true' },
  path: '/mailbox/:id/analytics'
}
