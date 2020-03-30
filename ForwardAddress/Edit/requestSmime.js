import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import history from 'app/Routes/History'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import FAClock from 'react-icons/lib/fa/clock-o'
import FALock from 'react-icons/lib/fa/lock'
import FAUnlock from 'react-icons/lib/fa/unlock'

import m from 'commons/I18n/'
import { timeAgo } from 'commons/Lib/Utils'
import { extractUserEmailData } from 'commons/Selectors/UserEmail'
import { createValidator, i18nize, required, email, maxLength, minLength, equalTo, notEqualTo } from 'commons/Lib/Validators'
import { getActiveDataFromStoreSlice } from 'commons/Redux/_Utils'
import CryptoActions, { CRYPTOAPI } from 'commons/Redux/CryptoRedux'

import FormSection from 'app/Components/Form/FormSection'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import Button from 'app/Components/Button'


export class EditForwardAddress extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object,

    data: PropTypes.object,

    className: PropTypes.string,
    requestSmime: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleSubmit (values) {

    const { data } = this.props
    const p = {
      useremail_id: data.id,
      passphrase: values.smimePassphrase,
      p12_passphrase: values.pkcs12Passphrase
    }
    const action = this.props.requestSmime
    return new Promise((resolve, reject) => action(p, resolve, reject))
  }

  componentWillMount () {
  }

  componentWillUnmount () {
  }

  _renderRequestSmime () {
    const { data, intl } = this.props

    return (
      <FormSection
        initiallyVisible
        disableToggle
        className='edit-view__body'
      >
      <div className='z-form__label'>
        <FormattedMessage { ...m.app.Crypto.smimeCertRequestForEmail }
          values={{eMail: data.email}}
          />
      </div>
      <div className='z-form__help'>
        <FormattedMessage { ...m.app.Crypto.encryptionRequestSmimeDesc1 } />
      </div>
      <div className='sep-top' />

      <div className='z-form__grid'>
        <div className='z-form__one-of-two'>
          <div className='z-form__label'>
            <FormattedMessage {...m.app.Crypto.pkcs12ArchiveTitle } />
          </div>
          <div className='z-form__help'>
            <FormattedMessage { ...m.app.Crypto.pkcs12ArchiveDesc1 } />
          </div>
        </div>
        <div className='z-form__one-of-two'>
          <div className='z-form__label'>
            <FormattedMessage {...m.app.Crypto.smimeCertificateTitle } />
          </div>
          <div className='z-form__help'>
            <FormattedMessage { ...m.app.Crypto.smimePassphraseDesc1 } />
          </div>
        </div>

        <div className='z-form__one-of-two'>
          <div className='sep-top' />
          <Field
            tabIndex={1}
            type='password'
            name='pkcs12Passphrase'
            component={ReduxFormTextInput}
            label={intl.formatMessage(m.app.Crypto.passphrase)}
          />
          <Field
            tabIndex={2}
            type='password'
            name='pkcs12PassphraseAgain'
            component={ReduxFormTextInput}
            label={intl.formatMessage(m.app.Crypto.passphraseAgain)}
          />
        </div>
        <div className='z-form__one-of-two'>
          <div className='sep-top' />
          <Field
            tabIndex={3}
            type='password'
            name='smimePassphrase'
            component={ReduxFormTextInput}
            label={intl.formatMessage(m.app.Crypto.passphrase)}
          />
          <Field
            tabIndex={4}
            type='password'
            name='smimePassphraseAgain'
            component={ReduxFormTextInput}
            label={intl.formatMessage(m.app.Crypto.passphraseAgain)}
          />
        </div>

      </div>
      </FormSection>
    )
  }

  render () {
    const { data, className, submitting, handleSubmit, intl, error } = this.props

    return (
      <FullPageView
        title={intl.formatMessage(m.app.Crypto.generateFreeSmimeCertificateUsing)}
        className='request-smime-container'
      >
      <form className='edit-view z-form z-form--alpha' onSubmit={handleSubmit(this._handleSubmit)}>
        { this._renderRequestSmime() }
        { error && <div className='z-form__error z-form__error-large'>{error}</div> }
        <FullPageViewToolbar contentRight>
          <Button
            btnStyle='success'
            inProgress={submitting}
            type='submit'
          >
            <FormattedMessage {...m.app.Crypto.requestCertificate} />
          </Button>
          <Button onClick={history.goBack} type='button'>
            <FormattedMessage {...m.app.Common.cancel} />
          </Button>
        </FullPageViewToolbar>
      </form>
      </FullPageView>
    )
  }
}

const validator = createValidator({
  smimePassphrase: [
    i18nize(required, m.app.CryptoValidation.passphraseRequired),
    i18nize(minLength, m.app.CryptoValidation.passphraseMinLength, [5]),
    i18nize(maxLength, m.app.CryptoValidation.passphraseMaxLength, [128]),
    i18nize(notEqualTo, m.app.CryptoValidation.passphraseMatchPkcs12, ['pkcs12Passphrase']),
  ],
  smimePassphraseAgain: [
    i18nize(required, m.app.CryptoValidation.passphraseRequired),
    i18nize(minLength, m.app.CryptoValidation.passphraseMinLength, [5]),
    i18nize(maxLength, m.app.CryptoValidation.passphraseMaxLength, [128]),
    i18nize(equalTo, m.app.CryptoValidation.passphraseDoNotMatch, ['smimePassphrase']),
  ],

  pkcs12Passphrase: [
    i18nize(required, m.app.CryptoValidation.passphraseRequired),
    i18nize(minLength, m.app.CryptoValidation.passphraseMinLength, [5]),
    i18nize(maxLength, m.app.CryptoValidation.passphraseMaxLength, [128]),
    i18nize(notEqualTo, m.app.CryptoValidation.passphraseMatchSmime, ['smimePassphrase']),
  ],
  pkcs12PassphraseAgain: [
    i18nize(required, m.app.CryptoValidation.passphraseRequired),
    i18nize(minLength, m.app.CryptoValidation.passphraseMinLength, [5]),
    i18nize(maxLength, m.app.CryptoValidation.passphraseMaxLength, [128]),
    i18nize(equalTo, m.app.CryptoValidation.passphraseDoNotMatch, ['pkcs12Passphrase']),
  ],

})

const FORM_IDENTIFIER = 'requestSmime'
const RequestSmimeForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: validator
})(EditForwardAddress)

const mapStateToProps = (state, ownProps) => {
  const props = {
    initialValues: {
      is_recovery: true
    }
  }
  const { data } = getActiveDataFromStoreSlice(state.useremail)
  const item = ownProps.params.id && data[ownProps.params.id]
  if (item) {
    props.data = item
  }

  return props
}

const mapDispatchToProps = {
  requestSmime: CryptoActions.cryptoUserEmailSmime
}

const IntlInjected = injectIntl(RequestSmimeForm)
const CRequestSmime = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const RequestSmimeRoute = {
  components: { children: CRequestSmime, hideNav: 'true' },
  path: '/esp/request/smime',
  childRoutes: [
    { path: ':id' }
  ]
}
