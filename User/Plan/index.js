import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field, SubmissionError } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import { filter, path } from 'ramda'
import scrollIntoView from 'scroll-into-view'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import PlanActions from 'commons/Redux/PlanRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { isPendingOnboard, currentPlanName, currentPlanId } from 'commons/Selectors/User'
import {
  getSelectedPlanName,
  getSelectedPlanFinalPriceData,
  getSelectedPlanYearlyPrice,
  fullPlanData,
  getSelectedPlanId
} from 'commons/Selectors/Plan'
import {
  createValidator,
  i18nize,
  required,
  creditCardNumber,
  creditCardCVV,
  creditCardExpiry,
  email
} from 'commons/Lib/Validators'
import { capitalize, getWindowWidth } from 'commons/Lib/Utils'

import history from 'app/Routes/History'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import Button from 'app/Components/Button'
import PlanTable from 'app/Components/PlanTable'
import { Payment } from 'app/Components/Payment'
import HelmetTitle from 'app/Components/HelmetTitle'

import TermsModal from './components/TermsModal'
import InvoiceDetails from './components/InvoiceDetails'

class _PlanSelection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    error: PropTypes.string,
    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
    initialValues: PropTypes.object,
    location: PropTypes.object,
    pristine: PropTypes.bool,

    fullPlansData: PropTypes.object,

    defaultTerm: PropTypes.string,
    currentPlanId: PropTypes.number,
    selectedPlanName: PropTypes.string,
    selectedPlanId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currentPlanName: PropTypes.string,
    yearlyPrice: PropTypes.number,
    finalPriceData: PropTypes.object,
    fetchPlans: PropTypes.func.isRequired,
    getUpgradePrice: PropTypes.func.isRequired,
    upgradePlan: PropTypes.func.isRequired,
    plansClear: PropTypes.func.isRequired,
    couponCheckClear: PropTypes.func.isRequired,
    getUpgradePriceClear: PropTypes.func.isRequired,
    upgradePlanClear: PropTypes.func.isRequired,
    isPendingOnboard: PropTypes.bool,
    useremail: PropTypes.object,
    useremailFetch: PropTypes.func,

    isWebViewEmbedded: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
    this._selectExistingCard = this._selectExistingCard.bind(this)
    this._setTerm = this._setTerm.bind(this)
    this._onPlanSelection = this._onPlanSelection.bind(this)
    this._showTermsModal = this._showTermsModal.bind(this)
    this._hideTermsModal = this._hideTermsModal.bind(this)

    this.state = {
      term: props.defaultTerm || 'year',
      termsModalVisible: false
    }
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.USER_PLAN)
    const planId = parseInt(this.props.location.query.plan_id, 10)
    if (planId && this.props.pristine) {
      if (planId > 4) this.setState({ term: 'month' })
      this.props.change('plan', parseInt(planId, 10))
      this.props.getUpgradePrice({ plan_id: planId })
    }
    if (this.props.location.hash === '#plan_upgrade_form') {
      scrollIntoView(this.formElement, {align: {top: 0}})
    }
  }

  componentWillMount () {
    // Re-direct user away if they are already on premium plan
    if (this.props.currentPlanName === 'premium') {
      history.push('/mailbox')
      return
    }

    // Fetch plans
    this.props.fetchPlans()

    // Get the upgrade price initially in case final price is pro-rated
    if (this.props.initialValues && this.props.initialValues.plan) {
      this.props.getUpgradePrice({ plan_id: this.props.initialValues.plan })
    }

    if (!this.props.useremail.data) {
      this.props.useremailFetch()
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.initialValues && nextProps.initialValues && nextProps.initialValues.plan) {
      this.props.getUpgradePrice({ plan_id: nextProps.initialValues.plan })
    }
  }

  componentWillUnmount () {
    this.props.plansClear()
    this.props.couponCheckClear()
    this.props.getUpgradePriceClear()
    this.props.upgradePlanClear()
  }

  _setTerm (term) {
    this.setState({ term: term })
  }

  _isFreePlanSelected () {
    return this.props.selectedPlanName === 'free'
  }

  _handleSubmit (values) {
    const payload = {}

    if (values.existingCardId) {
      payload.ccid = values.existingCardId
    } else {
      const expiry = values.ccExpiration.split('/')
      payload.ccinfo = {
        number: values.ccNumber,
        exp_month: expiry[0],
        exp_year: expiry[1],
        cvc: values.ccCVV
      }
      if (values.email) {
        payload.email = values.email
      }
    }

    payload.plan_id = values.plan

    if (values.coupon) {
      payload.coupon = values.coupon
    }

    return new Promise(
      (resolve, reject) =>
      this.props.upgradePlan(payload, resolve, e => reject(new SubmissionError({_error: e})))
    )
  }

  _selectExistingCard (id) {
    this.props.change('existingCardId', id)
    this.props.change('ccName', null)
    this.props.change('ccNumber', null)
    this.props.change('ccExpiration', null)
    this.props.change('ccCVV', null)
  }

  _showTermsModal () {
    this.setState({ termsModalVisible: true })
  }

  _hideTermsModal () {
    this.setState({ termsModalVisible: false })
  }

  _renderPayment () {
    const { currentPlanName, error, selectedPlanId, fullPlansData } = this.props

    // If free plan is selected then don't render the payment stuff
    if (this._isFreePlanSelected()) return null

    const fm = this.props.intl.formatMessage

    const price = (fullPlansData.planIdDetails && fullPlansData.planIdDetails[selectedPlanId]) ? fullPlansData.planIdDetails[selectedPlanId].price : null

    return (
      <div className='edit-view__body'>
        <InvoiceDetails
          currentPlanName={this.props.currentPlanName}
          price={price}
          finalPriceData={this.props.finalPriceData}
        />

        <Payment
          allowSelection
          error={error}
          selectExistingCard={this._selectExistingCard}
          openPaymentFormText={fm(m.app.User.newCard)}
          closePaymentFormText={fm(m.app.User.useExisting)}
          showEmailField
        />

        { currentPlanName !== 'free' ? null : (
          <Field
            tabIndex={5}
            type='text'
            name='coupon'
            smallLabel={fm(m.app.User.couponLabel)}
            helpText={fm(m.app.User.couponHelp)}
            component={ReduxFormTextInput}
          />
        )}
      </div>
    )
  }

  _handleFreePlanSelection () {
    ax.form.success(ax.EVENTS.USER_PLAN, {
      'Plan name': 'free',
      'Plan': 1
    })

    history.push('/identity/new#top')
  }

  _onPlanSelection (planId, planName) {
    if (planName === 'free') {
      this._handleFreePlanSelection()
      return
    }

    this.props.change('plan', planId)
    this.props.getUpgradePrice({ plan_id: planId })

    if (getWindowWidth() < 896) {
      const dropdownEl = document.getElementById('subscription-dropdown')
      if (dropdownEl) {
        scrollIntoView(dropdownEl, {align: {top: 0}})
      }
    }
  }

  _renderButton () {
    const { submitting } = this.props

    // If free plan is selected then render a link to new Identity page
    if (this._isFreePlanSelected()) {
      return (
        <Button tabIndex={6} btnStyle='success' onClick={this._handleFreePlanSelection}>
          <FormattedMessage {...m.app.Common.next} />
        </Button>
      )
    }

    return (
      <Button
        tabIndex={6}
        btnStyle='success'
        onClick={this.props.handleSubmit(this._handleSubmit)}
        inProgress={submitting}
      >
        <FormattedMessage {...m.app.Common.makePayment} />
      </Button>
    )
  }

  _getPlansData () {
    const { fullPlansData } = this.props
    const { term } = this.state

    if (!fullPlansData.data) return []

    const plans = filter(p => !p[term].disabled, fullPlansData.data)
    if (!plans) return []

    return plans.map(p => ({
      value: parseInt(p[term].id),
      label: (
        p.name === 'free'
          ? `Free Plan`
          : `${capitalize(p.name)} Plan ($${p[term].final_price}/${term})`
      )
    }))
  }

  render () {
    const { handleSubmit, isPendingOnboard, fullPlansData, isWebViewEmbedded } = this.props

    const fm = this.props.intl.formatMessage
    const titleTrans = isPendingOnboard ? m.app.User.selectPlan : m.app.User.upgradePlan

    return (
      <FullPageView
        title={fm(titleTrans)}
        hideCloseButton={isPendingOnboard || isWebViewEmbedded}
        className='plan-selection'
      >
        <HelmetTitle titleTrans={titleTrans} />
        <TermsModal
          isOpen={this.state.termsModalVisible}
          closeModal={this._hideTermsModal}
        />
        <PlanTable
          hideButtons
          hideFooter
          onTermChange={this._setTerm}
          plans={this.props.fullPlansData}
          defaultTerm={this.props.defaultTerm}
          currentPlanId={isPendingOnboard ? null : this.props.currentPlanId}
          onPlanSelection={this._onPlanSelection}
        />
        <form
          className='edit-view z-form z-form--alpha'
          onSubmit={handleSubmit(this._handleSubmit)}
          ref={(formElement) => {
            this.formElement = formElement
          }}
          id='#plan_upgrade_form'
        >
          <div className='edit-view__gray-container'>
            <div className='edit-view__body' id='subscription-dropdown'>
              <Field
                name='plan'
                component={ReduxFormSelect}
                options={this._getPlansData()}
                isLoading={fullPlansData.inProgress}
                label={fm(m.app.User.subscriptionTitle)}
                helpText={fm(m.app.User.subscriptionHelp)}
              />
            </div>
          </div>

          { this._renderPayment() }

          <FullPageViewToolbar contentRight>
            { this._renderButton() }
            <Button onClick={this._showTermsModal}>
              <FormattedMessage {...m.app.Common.viewTerms} />
            </Button>
          </FullPageViewToolbar>
        </form>
      </FullPageView>
    )
  }
}

const validator = createValidator({
  plan: [i18nize(required, m.app.UserValidation.planRequired)],
  ccName: [i18nize(required, m.app.UserValidation.ccNameRequired)],
  ccNumber: [
    i18nize(required, m.app.UserValidation.ccNumberRequired),
    i18nize(creditCardNumber, m.app.UserValidation.ccNumberInvalid)
  ],
  ccCVV: [
    i18nize(required, m.app.UserValidation.ccCVVRequired),
    i18nize(creditCardCVV, m.app.UserValidation.ccCVVInvalid)
  ],
  ccExpiration: [
    i18nize(required, m.app.UserValidation.ccExpirationRequired),
    i18nize(creditCardExpiry, m.app.UserValidation.ccExpirationInvalid)
  ],
  email: [
    i18nize(email, m.app.CommonValidation.emailInvalid)
  ]
})

// Async validator for plan selection form that checks the coupon
// and gets upgrade price w/coupon if available
// Should be triggered on change in plan dropdown or coupon field
const planSelectionFormAsyncValidator = (values, dispatch, props) => {
  // If coupon is present then get the upgrade price with coupon applied
  // and also validate the coupon
  if (values.coupon && values.plan) {
    // props.getUpgradePrice({coupon: values.coupon, plan_id: values.plan})
    return new Promise((resolve, reject) => {
      props.getUpgradePrice(
        {coupon: values.coupon, plan_id: values.plan},
        response => {
          if (parseInt(response.price) === parseInt(props.yearlyPrice)) {
            return reject({'coupon': 'Invalid coupon'})
          } else {
            return resolve()
          }
        },
        error => reject({'coupon': error})
      )
    })
  // Otherwise just get the upgrade price (if it's not free plan)
  } else if (props.selectedPlanName !== 'free') {
    props.getUpgradePrice({plan_id: values.plan})
  }

  // return a resolved promise as required by redux-form
  return Promise.resolve()
}

const PlanSelectionForm = reduxForm({
  form: 'planSelection',
  validate: validator,
  asyncBlurFields: ['coupon', 'plan'],
  asyncValidate: planSelectionFormAsyncValidator
})(_PlanSelection)

const mapStateToProps = state => {
  const _isPendingOnboard = isPendingOnboard(state)
  const _fullPlanData = fullPlanData(state)

  const props = {
    isWebViewEmbedded: state.app.isWebViewEmbedded,
    currentPlanId: currentPlanId(state),
    currentPlanName: currentPlanName(state),
    fullPlansData: _fullPlanData,
    yearlyPrice: getSelectedPlanYearlyPrice(state),
    finalPriceData: getSelectedPlanFinalPriceData(state),
    selectedPlanId: getSelectedPlanId(state),
    selectedPlanName: getSelectedPlanName(state),
    isPendingOnboard: _isPendingOnboard,
    useremail: state.useremail,
    initialValues: {}
  }

  if (_fullPlanData.data && state.payment.data && state.useremail.data) {
    const esp = state.useremail.dataOrder.length ? state.useremail.data[state.useremail.dataOrder[0]].email : null
    const cardEmail = state.payment.dataOrder.length ? state.payment.data[state.payment.dataOrder[0]].email : null

    props.initialValues.email = cardEmail || esp
  }

  if (_isPendingOnboard) {
    let defaultPlan = null

    const newUserSelectedPlan = path(['plan', 'newUserSelectedPlan'], state)
    if (newUserSelectedPlan) {
      defaultPlan = newUserSelectedPlan
      props.defaultTerm = path(['plan', 'newUserSelectedPlanTerm'], state)
    } else {
      defaultPlan = path(['dataObj', 'plus', 'year', 'id'], _fullPlanData)
    }

    props.initialValues.plan = defaultPlan
  }

  return props
}

const mapDispatchToProps = {
  upgradePlan: PlanActions.upgradePlanRequest,
  plansClear: PlanActions.plansClear,
  couponCheckClear: PlanActions.couponCheckClear,
  getUpgradePriceClear: PlanActions.getUpgradePriceClear,
  upgradePlanClear: PlanActions.upgradePlanClear,
  fetchPlans: PlanActions.plansRequest,
  checkCoupon: PlanActions.couponCheckRequest,
  getUpgradePrice: PlanActions.getUpgradePriceRequest,
  useremailFetch: UserEmailActions.useremailFetch
}

const IntlInjected = injectIntl(PlanSelectionForm)
export const PlanSelection = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const PlanSelectionRoute = {
  components: { children: PlanSelection, hideNav: 'true' },
  path: '/plan'
}
