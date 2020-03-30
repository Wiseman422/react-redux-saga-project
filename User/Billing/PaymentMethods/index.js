import React from 'react'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'

import m from 'commons/I18n/'

import { Payment } from 'app/Components/Payment'
import DrawerActions from 'app/Redux/DrawerRedux'
import HelmetTitle from 'app/Components/HelmetTitle'

import BillingDetails from '../BillingDetails'

const _Cards = ({
  intl,
  isGTSmScreen,
  openBillingDrawer,
  dataRequestInProgress,
  dataOrder
}) => (
  <BillingDetails
    title={intl.formatMessage(m.app.Billing.paymentMethods)}
    isMediumScreen={isGTSmScreen}
    titleOnClick={!isGTSmScreen ? openBillingDrawer : null}
    dataFetchInProgress={dataRequestInProgress}
    totalCount={dataOrder ? dataOrder.length : 0}
  >
    <HelmetTitle titleTrans={m.app.Billing.paymentMethods} />
    <Payment
      paymentsHeaderText={intl.formatMessage(m.app.Billing.yourPaymentMethods)}
      openPaymentFormText={intl.formatMessage(m.app.Billing.addNewPayment)}
      closePaymentFormText={intl.formatMessage(m.app.Billing.cancelNewPayment)}
    />
  </BillingDetails>
)

_Cards.propTypes = {
  intl: intlShape.isRequired,
  isGTSmScreen: PropTypes.bool,
  openBillingDrawer: PropTypes.func,
  dataRequestInProgress: PropTypes.bool,
  dataOrder: PropTypes.array
}

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  dataRequestInProgress: path(['payment', 'dataRequestInProgress'], state),
  dataOrder: path(['payment', 'dataOrder'], state)
})

const mapDispatchToProps = {
  openBillingDrawer: DrawerActions.openBillingDrawer
}

const IntlInjected = injectIntl(_Cards)

export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
