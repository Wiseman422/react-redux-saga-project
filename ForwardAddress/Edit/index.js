import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'react-router/lib/Link'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import history from 'app/Routes/History'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import FAExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import Actions from 'commons/Redux/UserEmailRedux'
import { createValidator, i18nize, required } from 'commons/Lib/Validators'
import { getActiveDataFromStoreSlice } from 'commons/Redux/_Utils'
import CryptoActions, { CRYPTOAPI } from 'commons/Redux/CryptoRedux'
import { promiseBinaryDataFromFile } from 'commons/Lib/FileReader'
import log from 'commons/Services/Log'

import CryptoView from 'app/Components/CryptoView'
import EditViewHeader from 'app/Components/EditViewHeader'
import FormSection from 'app/Components/Form/FormSection'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormSwitch from 'app/Components/Form/ReduxFormSwitch'
import { FullPageViewToolbar } from 'app/Components/FullPageView'
import Button from 'app/Components/Button'
import HelmetTitle from 'app/Components/HelmetTitle'

export class EditForwardAddress extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object,

    data: PropTypes.object,

    className: PropTypes.string,
    isPendingOnboard: PropTypes.bool,

    addCrypto: PropTypes.func.isRequired,
    editUserEmail: PropTypes.func.isRequired,
    requestSmime: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      pgp_files: [],
      smime_files: []
    }

    this._handleSubmit = this._handleSubmit.bind(this)
    this._requestSmimeCertificate = this._requestSmimeCertificate.bind(this)
    this._handlePgpFileUpload = this._handlePgpFileUpload.bind(this)
    this._handleSmimeFileUpload = this._handleSmimeFileUpload.bind(this)
  }

  componentDidMount () {
    ax.form.editPageView(ax.EVENTS.FORWARD_ADDRESS_FORM)
  }

  _handleFileUpload (encType, files) {
    if (! encType || !files) {
      return null
    }

    return new Promise((resolve, reject) => {
      Promise.all(
        files.map(file =>
          promiseBinaryDataFromFile(file)
          .then((data) => {
            const p = {
              public: data,
              useremail_id: this.props.data.id,
              enc_type: encType,
              owner_type: CRYPTOAPI.OWNER_TYPE.USER_EMAIL
            }
            log.debug(p)
            return new Promise((resolve, reject) =>
              this.props.addCrypto(p, resolve, reject)
            ).then(() => {
              log.debug('addCrypto done')
              const actionName = encType === CRYPTOAPI.ENC_TYPE.PGP ? 'PGP Added' : 'SMIME Added'
              ax.action(ax.EVENTS.FORWARD_ADDRESS, actionName)
              this.setState({forceRefresh: true})
            })
          })
        )
      )
    })
  }

  _handlePgpFileUpload (files) {
    log.debug('_handlePgpFileUpload')
    this._handleFileUpload(CRYPTOAPI.ENC_TYPE.PGP, files)
  }

  _handleSmimeFileUpload (files) {
    log.debug('_handleSmimeFileUpload')
    this._handleFileUpload(CRYPTOAPI.ENC_TYPE.SMIME, files)
  }

  _requestSmimeCertificate () {
    const { data } = this.props
    const p = {
      useremail_id: data.id
    }
    const action = this.props.requestSmime
    return new Promise((resolve, reject) => action(p, resolve, reject))
  }

  _handleSubmit (values) {
    const { data } = this.props
    let p = {
      id: data.id,
      display_name: values.displayName,
      is_recovery: values.is_recovery
    }

    const action = this.props.editUserEmail
    return new Promise((resolve, reject) => action(p, resolve, reject))
  }

  _renderFooter () {
    const { data, handleSubmit, submitting } = this.props
    if (data.is_confirmed) {
      return (
        <FullPageViewToolbar contentRight>
          <Button
            btnStyle='success'
            type='submit'
            inProgress={submitting}
          >
          <FormattedMessage {...m.app.Common.saveChanges} />
          </Button>
          <Button onClick={history.goBack} type='button'>
            <FormattedMessage {...m.app.Common.cancel} />
          </Button>
        </FullPageViewToolbar>
      )
    } else {
      return (
        <FullPageViewToolbar contentRight>
          <Button
            btnStyle='success'
            disabled
          >
          <FormattedMessage {...m.app.Common.saveChanges} />
          </Button>
          <Button onClick={history.goBack} type='button'>
            <FormattedMessage {...m.app.Common.cancel} />
          </Button>
        </FullPageViewToolbar>
      )
    }
  }

  componentWillMount () {
    if (!this.props.data) {
      history.push('/esp')
      return
    }
  }

  componentWillUnmount () {
  }

  _renderNotConfirmed () {
    const { data } = this.props
    if (! data || data.is_confirmed) {
      return null
    }

    return (
      <div>
      <div className='edit-view__info'>
        <div className='red-icon'>
          <FAExclamationTriangle />&nbsp;
          <FormattedMessage {...m.app.ForwardAddress.pleaseCheckForConfirmationEmail}
            values={{eMail: <span className='underline'>{data.email}</span>}}
          />
        </div>
      </div>
      <div className='sep-bottom-lg' />
      </div>
    )
  }

  render () {
    if (!this.props.data) return null

    const { data, className, submitting, handleSubmit, intl, timezone } = this.props

    var linkFreeCert = <FormattedMessage { ...m.app.Crypto.requestFreeSmimeCertificate } />
    if (data.is_confirmed) {
      linkFreeCert = (
        <Link to={`/esp/request/smime/${data.id}`} className='actionLink'>
          <FormattedMessage { ...m.app.Crypto.requestFreeSmimeCertificate } />
        </Link>
      )
    }

    return (
      <div className={`${className} edit-view edit-view--with-detail-top-bar-spacing`}>
        <HelmetTitle titleTrans={m.app.ForwardAddress.editTitle} />
        <EditViewHeader data={data} timezone={timezone} />
        <form className={`z-form z-form--alpha`} onSubmit={handleSubmit(this._handleSubmit)}>
          <div className='edit-view__body edit-view__body--fluid'>

            <FormSection disableToggle withTopBorder>
              <div className='z-form__grid'>
                <div className='z-form__one-of-two'>
                  <Field
                    tabIndex={1}
                    type='text'
                    name='displayName'
                    component={ReduxFormTextInput}
                    label={intl.formatMessage(m.app.Common.displayName)}
                    helpText={intl.formatMessage(m.app.ForwardAddress.editDisplayNameHelp1)}
                  />
                </div>
              </div>
            </FormSection>
            { this._renderNotConfirmed() }

            <FormSection
              title={intl.formatMessage(m.app.ForwardAddress.editRecoveryTitle)}
              initiallyVisible
              withTopBorder
            >
              <Field
                tabIndex={2}
                name='is_recovery'
                component={ReduxFormSwitch}
                label={intl.formatMessage(m.app.ForwardAddress.editRecoveryToggle)}
              />
            </FormSection>

            <FormSection
              title={intl.formatMessage(m.app.Crypto.encryptionSetupFormTitle)}
              initiallyVisible
              withTopBorder
            >
              <hr />
              <div className='z-form__help'>
                <FormattedMessage { ...m.app.ForwardAddress.editCryptoForwardHelp } />
              </div>
              <div className='sep-top' />

              <CryptoView
                email={data.email}
                smime={data.crypto.smime}
                pgp={data.crypto.pgp}
                requestSmimeTitle={m.app.Crypto.requestFreeSmimeCertificate}
                requestSmimeTo={!data.is_confirmed ? null : `/esp/request/smime/${data.id}`}
                pgpFileUploadCb={this._handlePgpFileUpload}
                smimeFileUploadCb={this._handleSmimeFileUpload}
              />
            </FormSection>

          </div>
          { this._renderFooter() }
        </form>
      </div>
    )
  }
}

const validator = createValidator({
  displayName: [
    i18nize(required, m.app.CommonValidation.displayNameRequired)
  ],

})

const FORM_IDENTIFIER = 'editForwardAddress'
const EditForwardAddressForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: validator
})(EditForwardAddress)

const mapStateToProps = (state, ownProps) => {
  const props = {}
  const { data } = getActiveDataFromStoreSlice(state.useremail)
  const item = (data && ownProps.params.id) ? data[ownProps.params.id] : null

  if (item) {
    props.data = item
    props.initialValues = {
      displayName: item.display_name,
      email: item.email,
      is_recovery: item.is_recovery
    }
  }
  props.timezone = state.user.data.timezone
  return props
}

const mapDispatchToProps = {
  addCrypto: Actions.addCryptoRequest,  // API Package
  editUserEmail: Actions.useremailEdit, // API BASE_WRITE
  requestSmime: CryptoActions.cryptoUserEmailSmime, // API OLD CUSTOM
}

const IntlInjected = injectIntl(EditForwardAddressForm)
const CEditForwardAddress = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export default CEditForwardAddress
