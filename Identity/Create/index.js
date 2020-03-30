import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import Link from 'react-router/lib/Link'
import { reduxForm, Field, startAsyncValidation, stopAsyncValidation } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import faker from 'faker'
import debounce from 'debounce'
import FACheck from 'react-icons/lib/fa/check'

import m from 'commons/I18n/'
import IdentityActions from 'commons/Redux/IdentityRedux'
import DomainActions from 'commons/Redux/UsableDomainRedux'
import UsableUserEmailActions from 'commons/Redux/UsableUserEmailRedux'
import { extractDomainData } from 'commons/Selectors/Domain'
import { extractRegionDataFromUser } from 'commons/Selectors/Region'
import { isPendingOnboard } from 'commons/Selectors/User'
import { getReduxFormValue } from 'commons/Selectors/ReduxForm'
import { extractUserEmailData } from 'commons/Selectors/UserEmail'
import { createValidator, i18nize, required, emailUsername, minLength } from 'commons/Lib/Validators'
import log from 'commons/Services/Log'
import ax from 'commons/Services/Analytics/index'

import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import Button from 'app/Components/Button'
import ReduxFormSwitch from 'app/Components/Form/ReduxFormSwitch'
import pathanalytics from 'app/assets/benefits/pathanalytics_cropped.png'
import CountryLabel from 'app/Components/CountryLabel'
import HelmetTitle from 'app/Components/HelmetTitle'

import { IdentityCreateFormBasicInfo } from '../components/BasicInfo'
import CreateIdentityCertGeneration from '../components/CertGeneration'

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const ForwardEmail = p => (
  <div className='z-form__indent'>
    <Field
      tabIndex={12}
      name='forwardToESP'
      noResultsText={null}
      component={ReduxFormSelect}
      smallLabel={p.fm(m.app.Identity.forwardToDestination)}
      helpText={p.fm(m.app.Identity.forwardToDestinationHelp)}
      options={p.userEmail.data}
      isLoading={p.userEmail.dataRequestInProgress}
      searchForQuery={p.setUserEmailSearchQuery}
    />
    {
      !p.forwardToESP ? null : (
        <Field
          tabIndex={13}
          name='forwardOptionPrefixOrigin'
          component={ReduxFormSwitch}
          label={p.fm(m.app.Identity.forwardOptionPrefixOrigin)}
        />
      )
    }

  </div>
)

export class CreateIdentity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    change: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.string,

    // async email validation
    validateIdentity: PropTypes.func.isRequired,
    validateIdentityApi: PropTypes.object.isRequired,
    emailUsername: PropTypes.string,
    emailDomain: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    asyncValidating: PropTypes.any,

    isGTSmScreen: PropTypes.bool,
    isPendingOnboard: PropTypes.bool,
    user: PropTypes.object.isRequired,
    region: PropTypes.object.isRequired,
    domain: PropTypes.object.isRequired,
    identityFinishCreation: PropTypes.func.isRequired,
    fetchDomains: PropTypes.func.isRequired,
    setDomainSearchQuery: PropTypes.func.isRequired,
    clearDomainSearchData: PropTypes.func.isRequired,
    createIdentity: PropTypes.func.isRequired,
    forwardEmail: PropTypes.bool,
    forwardToESP: PropTypes.number,
    userEmail: PropTypes.object.isRequired,
    fetchUserEmails: PropTypes.func.isRequired,
    setUserEmailSearchQuery: PropTypes.func.isRequired,
    clearUserEmailSearchData: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.identityResult = null
    this._handleSubmit = this._handleSubmit.bind(this)
    this._generateMailbox = this._generateMailbox.bind(this)

    // async email validation
    this._handleEmailChange = debounce(this._handleEmailChange.bind(this), 300)
    this._validateEmailOnNextProps = this._validateEmailOnNextProps.bind(this)
  }

  componentDidMount () {
    ax.form.createPageView(ax.EVENTS.IDENTITY_FORM)
  }

  _handleSubmit (values) {
    let p = {
      display_name: values.displayName,
      region: values.countryOfOrigin,
      email: `${values.emailUsername}@${values.emailDomain}`,
      country_flag_emoji: !!values.forwardOptionPrefixOrigin,
      http_pickup: !values.forwardEmail,
      next_hop_exit: !!values.forwardEmail
    }

    if (values.forwardEmail && values.forwardToESP) {
      p.useremail_id = values.forwardToESP
    }

    return new Promise((resolve, reject) =>
      this.props.createIdentity(p, resolve, reject)
    ).then((result) => {
      // For Cert-generation
      this.identityResult = result
    })
  }

  _generateMailbox () {
    const { user, domain, region } = this.props

    try {
      let randMailbox = faker.internet.email().split('@')[0]
      randMailbox = randMailbox.replace(/[^A-Za-z0-9]/g, '')

      if (user.data.locale) {
        faker.locale = user.data.locale.slice(0, 2)
      }

      let randName = faker.name.findName()
      if (randName) {
        this.props.change('displayName', randName)
        this.props.change('emailUsername', randMailbox)
      }

      const randomDomainIndex = getRandomInt(0, domain.data.length - 1)
      const randomDomainName = domain.data[randomDomainIndex].value
      this.props.change('emailDomain', randomDomainName)

      const randomRegionIndex = getRandomInt(0, region.data.length - 1)
      const randomRegionName = region.data[randomRegionIndex].value
      this.props.change('countryOfOrigin', randomRegionName)
    } catch (e) {
      log.debug('generateMailbox caught -', e)
    }
  }

  _renderIntro () {
    if (!this.props.isPendingOnboard) return null

    return (
      <div className='identity-create__intro-container'>
        <div className='identity-create__intro'>
          <img
            src={pathanalytics}
            className='identity-create__intro__image'
            alt='Email path analytics'
          />
          <div className='identity-create__intro__content'>
            <p><FormattedMessage {...m.app.Identity.intro1} /></p>
            <p><FormattedMessage {...m.app.Identity.intro2} /></p>
            <p><FormattedMessage {...m.app.Identity.intro3} /></p>
          </div>
        </div>
      </div>
    )
  }

  _renderForwardingSettings () {
    if (this.props.isPendingOnboard) return null

    const { intl, forwardEmail, userEmail, forwardToESP, user } = this.props
    const fm = intl.formatMessage

    return (
      <div className='edit-view__body'>
        <div className='z-title'>
          <FormattedMessage {...m.app.Identity.emailForwardingTitle} />
        </div>
        <Field
          tabIndex={11}
          name='forwardEmail'
          component={ReduxFormSwitch}
          label={fm(m.app.Identity.forwardEmail)}
          helpText={fm(m.app.Identity.forwardEmailHelp)}
          disabled={!user.data.has_confirmed_esp}
        />
        { user.data.has_confirmed_esp ? null : (
          <span className='z-form__error'>
            <FormattedMessage {...m.app.Identity.confirmESPToEnableForwarding} />
          </span>
        )}
        { !forwardEmail ? null : (
          <ForwardEmail
            fm={fm}
            userEmail={userEmail}
            forwardToESP={forwardToESP}
            setUserEmailSearchQuery={this.props.setUserEmailSearchQuery}
          />
        )}
      </div>
    )
  }

  _handleEmailChange () {
    const username = this.props.emailUsername
    const domain = this.props.emailDomain
    const dispatch = this.props.dispatch

    // if we do not have an email, there is nothing to validate
    if (!username || !domain) return

    dispatch(startAsyncValidation(FORM_IDENTIFIER))
    this.props.validateIdentity({ email: `${username}@${domain}` })
  }

  _validateEmailOnNextProps (nextProps) {
    // validate identity
    if (nextProps.validateIdentityApi === this.props.validateIdentityApi) return
    const data = nextProps.validateIdentityApi
    const fm = this.props.intl.formatMessage
    if (data.inProgress || !this.props.asyncValidating) return
    if (data.error) {
      const errorMsg = fm(m.app.Identity.emailTaken, { email: `${this.props.emailUsername}@${this.props.emailDomain}` })
      this.props.dispatch(stopAsyncValidation(FORM_IDENTIFIER, { emailUsername: errorMsg }))
    } else {
      this.props.dispatch(stopAsyncValidation(FORM_IDENTIFIER, {}))
    }
  }

  componentWillReceiveProps (nextProps) {
    this._validateEmailOnNextProps(nextProps)
  }

  componentWillMount () {
    const { domain, fetchDomains, userEmail, fetchUserEmails } = this.props

    if (!domain.data || !domain.dataOrder) fetchDomains()

    if (!userEmail.data || !userEmail.dataOrder) fetchUserEmails()
  }

  componentWillUnmount () {
    this.props.clearDomainSearchData()
    this.props.clearUserEmailSearchData()
  }

  render () {
    const { submitting, submitSucceeded, handleSubmit, intl, domain, region, setDomainSearchQuery, isPendingOnboard, error } = this.props

    const fm = intl.formatMessage
    let emailUsernameIcon = null
    const validateIdentityApi = this.props.validateIdentityApi
    if (this.props.emailUsername && this.props.emailDomain) {
      if (!validateIdentityApi.error) emailUsernameIcon = <FACheck className='green' />
    }

    const subTitle = (
      <span>
        <FormattedMessage {...m.app.Identity.newMailboxFormGeneration} />
        &nbsp;
        <Link className='page-header__toolbar__button' onClick={() => this._generateMailbox()}>
          <FormattedMessage {...m.app.Common.clickForRandom} />
        </Link>
      </span>
    )

    if (submitSucceeded) {
      window.scrollTo(0, 0)
      return <CreateIdentityCertGeneration finish={this.props.identityFinishCreation} identityResult={this.identityResult} />
    }

    return (
      <FullPageView
        title={fm(m.app.Identity.creationPageTitle)}
        subTitle={subTitle}
        hideCloseButton={isPendingOnboard}
      >
        <HelmetTitle titleTrans={m.app.Identity.creationPageTitle} />
        <form className='edit-view z-form z-form--alpha' onSubmit={handleSubmit(this._handleSubmit)}>
          <div className='edit-view__body'>
            { error && <div className='z-form__error z-form__error--large'>{error}</div> }

            <div className='z-form__grid'>
              <div className='z-form__one-of-two'>
                <Field
                  tabIndex={1}
                  type='text'
                  name='displayName'
                  placeholder='John Doe'
                  component={ReduxFormTextInput}
                  label={fm(m.app.Common.displayName)}
                  helpText={fm(m.app.Identity.displayNameHelp)}
                />
              </div>
              <div className='z-form__one-of-two identity-create__top-country-field'>
                <Field
                  tabIndex={2}
                  name='countryOfOrigin'
                  noResultsText={null}
                  component={ReduxFormSelect}
                  label={fm(m.app.Identity.countryOfOrigin)}
                  helpText={fm(m.app.Identity.countryOfOriginHelp)}
                  options={region.data}
                />
              </div>
            </div>

            <div className='z-form__grid'>
              <div className='identity-create__email-username-field'>
                <Field
                  tabIndex={3}
                  type='text'
                  name='emailUsername'
                  placeholder='johndoe'
                  component={ReduxFormTextInput}
                  label={fm(m.app.Mailbox.mailbox)}
                  onChange={this._handleEmailChange}
                  loading={this.props.validateIdentityApi.inProgress}
                  icon={emailUsernameIcon}
                />
                <span className='identity-create__email-username-field__at-icon'>@</span>
              </div>
              <div className='identity-create__email-domain-field'>
                <Field
                  tabIndex={4}
                  name='emailDomain'
                  component={ReduxFormSelect}
                  label={fm(m.app.Domain.domain)}
                  options={domain.data}
                  isLoading={domain.dataRequestInProgress}
                  searchForQuery={setDomainSearchQuery}
                  onChange={this._handleEmailChange}
                />
              </div>
            </div>
            <div className='z-form__help'><FormattedMessage {...m.app.Identity.emailHelp} /></div>
          </div>

          <IdentityCreateFormBasicInfo />

          <div className='edit-view__body identity-create__bottom-country-field'>
            <Field
              tabIndex={5}
              name='countryOfOrigin'
              noResultsText={null}
              component={ReduxFormSelect}
              label={fm(m.app.Identity.countryOfOrigin)}
              helpText={fm(m.app.Identity.countryOfOriginHelp)}
              options={region.data}
            />
          </div>

          { this._renderForwardingSettings() }

          <FullPageViewToolbar contentRight>
            <Button
              tabIndex={5}
              btnStyle='success'
              inProgress={submitting}
              type='submit'
            >
              <FormattedMessage {...m.app.Common.saveChanges} />
            </Button>
          </FullPageViewToolbar>

          { this._renderIntro() }
        </form>
      </FullPageView>
    )
  }
}

const validator = createValidator({
  displayName: [
    i18nize(required, m.app.IdentityValidation.displayNameRequired),
    i18nize(minLength, m.app.IdentityValidation.displayNameMinLength, [4])
  ],
  emailUsername: [
    i18nize(required, m.app.CommonValidation.thisCannotBeEmpty),
    i18nize(minLength, m.app.CommonValidation.minLength4, [4]),
    i18nize(emailUsername, m.app.IdentityValidation.emailUsernameValid)
  ],
  emailDomain: [
    i18nize(required, m.app.CommonValidation.domainRequired)
  ],
  countryOfOrigin: [
    i18nize(required, m.app.CommonValidation.thisCannotBeEmpty)
  ]
})

const FORM_IDENTIFIER = 'createIdentity'
const CreateIdentityForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: validator
})(CreateIdentity)

const mapStateToProps = state => ({
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  user: state.user,
  domain: extractDomainData(state.usableDomain),
  region: extractRegionDataFromUser(state.user, CountryLabel),
  displayName: getReduxFormValue(state, FORM_IDENTIFIER, 'displayName'),
  emailUsername: getReduxFormValue(state, FORM_IDENTIFIER, 'emailUsername'),
  emailDomain: getReduxFormValue(state, FORM_IDENTIFIER, 'emailDomain'),
  countryOfOrigin: getReduxFormValue(state, FORM_IDENTIFIER, 'countryOfOrigin'),
  forwardEmail: getReduxFormValue(state, FORM_IDENTIFIER, 'forwardEmail'),
  forwardToESP: getReduxFormValue(state, FORM_IDENTIFIER, 'forwardToESP'),
  userEmail: extractUserEmailData(state.usableUserEmail),
  isPendingOnboard: isPendingOnboard(state),
  validateIdentityApi: state.identity.api.validateIdentity,
  initialValues: {
    countryOfOrigin: state.user.data.region || 'us'
  }
})

const mapDispatchToProps = {
  createIdentity: IdentityActions.identityCreate,
  validateIdentity: IdentityActions.validateIdentityRequest,
  identityFinishCreation: IdentityActions.identityFinishCreation,
  fetchDomains: DomainActions.usableDomainFetch,
  clearDomainSearchData: DomainActions.usableDomainClearSearchData,
  setDomainSearchQuery: DomainActions.usableDomainSetSearchQuery,
  fetchUserEmails: UsableUserEmailActions.usableUserEmailFetch,
  clearUserEmailSearchData: UsableUserEmailActions.usableUserEmailClearSearchData,
  setUserEmailSearchQuery: UsableUserEmailActions.usableUserEmailSetSearchQuery
}

const IntlInjected = injectIntl(CreateIdentityForm)
const CCreateIdentity = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const CreateIdentityRoute = {
  components: { children: CCreateIdentity, hideNav: 'true' },
  path: '/identity/new'
}
