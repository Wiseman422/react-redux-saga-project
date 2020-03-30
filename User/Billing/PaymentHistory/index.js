import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import FAMoonO from 'react-icons/lib/fa/moon-o'
import FACircle from 'react-icons/lib/fa/circle'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import FABars from 'react-icons/lib/fa/bars'
import { path } from 'ramda'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import { timeAgo } from 'commons/Lib/Utils'
import Actions, { REDUX_CONFIG } from 'commons/Redux/PaymentHistoryRedux'
import { getCommonListReduxValues, commonListReduxValueProps } from 'commons/Redux/_Utils'

import DrawerActions from 'app/Redux/DrawerRedux'
import ListView from 'app/Components/ListView'
import EmptyList from 'app/Components/ListView/components/EmptyList'
import HelmetTitle from 'app/Components/HelmetTitle'

class _PaymentHistoryList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    timezone: PropTypes.string,
    fetchData: PropTypes.func,
    clearSearchResultsData: PropTypes.func,
    setSearchQuery: PropTypes.func,
    ...commonListReduxValueProps
  }

  constructor (props) {
    super(props)
    this._renderElement = this._renderElement.bind(this)
  }

  componentDidMount () {
    ax.listPageView(ax.EVENTS.PAYMENT_HISTORY)
  }

  _renderEmptyList () {
    return (
      <EmptyList icon={<FAMoonO size='60' />}>
        <FormattedMessage {...m.app.Billing.emptyList} />
      </EmptyList>
    )
  }

  _renderElement (data, params, intl) {
    const titleClass = data.is_success ? 'list-item__title' : 'list-item__title-alert'
    const typeMap = {
      1: m.app.Billing.planUpgrade,
      2: m.app.Billing.planRenew,
      10: m.app.Billing.domainPurchase
    }
    const { timezone } = this.props
    return (
      <div className='list-item' key={data.id}>
        <div className='list-item__timestamp'>{timeAgo(data.created_on, intl, timezone)}</div>
        <div className={titleClass}>
          <FormattedMessage {...typeMap[data.reason_type]} />
        </div>
        <div>
          <div className='list-item__analytics-col'>
            <FormattedMessage {...m.app.Billing.status} />{':'}
          </div>
          <div className={classnames({
            'list-item__analytics-data': true,
            'list-item__analytics-data__alert': !data.is_success
          })}>
            {data.is_success ? <FormattedMessage {...m.app.Billing.paymentSuccess} /> : <FormattedMessage {...m.app.Billing.paymentFailure} />}
          </div>
        </div>
        {data.amount &&
        <div>
          <div className='list-item__analytics-col'>
            <FormattedMessage {...m.app.Billing.amount} />{':'}
          </div>
          <div className='list-item__analytics-data'>
            {`${data.amount} ${data.currency}`}
          </div>
        </div>
        }
      </div>
    )
  }

  render () {
    const { intl, isGTSmScreen, openBillingDrawer } = this.props
    return (
      <div>
        <HelmetTitle titleTrans={m.app.Billing.paymentHistory} />
        <ListView
          title={intl.formatMessage(m.app.Billing.paymentHistory)}
          titleIcon={!isGTSmScreen ? FABars : null}
          titleOnClick={!isGTSmScreen ? openBillingDrawer : null}
          renderElement={this._renderElement}
          elementHeight={92}
          renderEmptyList={this._renderEmptyList}
          disableSearch
          {...this.props}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  timezone: state.user.data.timezone,
  ...getCommonListReduxValues(state, REDUX_CONFIG.statePrefix)
})

const mapDispatchToProps = {
  fetchData: Actions.paymentHistoryFetch,
  clearSearchResultsData: Actions.paymentHistoryClearSearchData,
  setSearchQuery: Actions.paymentHistorySetSearchQuery,
  openBillingDrawer: DrawerActions.openBillingDrawer
}

const IntlInjected = injectIntl(_PaymentHistoryList)
export const PaymentHistoryList = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const PaymentHistoryListRoute = {
  component: PaymentHistoryList,
  path: '/history'
}
