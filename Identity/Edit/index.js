import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import history from 'app/Routes/History'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import Dropzone from 'react-dropzone'
import request from 'superagent'
import { path } from 'ramda'
import FACircleONotch from 'react-icons/lib/fa/circle-o-notch'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import { promiseBinaryDataFromFile } from 'commons/Lib/FileReader'
import UsableUserEmailActions from 'commons/Redux/UsableUserEmailRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import { extractUserEmailData } from 'commons/Selectors/UserEmail'
import { extractRegionDataFromUser } from 'commons/Selectors/Region'
import { createValidator, i18nize, required, minLength, invalidIf } from 'commons/Lib/Validators'
import { getActiveDataFromStoreSlice } from 'commons/Redux/_Utils'
import { api } from 'commons/Sagas/APISagas'
import { createSignature } from 'commons/Services/API/Utils/signature'
import { getReduxFormValue } from 'commons/Selectors/ReduxForm'

import CountryLabel from 'app/Components/CountryLabel'
import EditViewHeader from 'app/Components/EditViewHeader'
import FormSection from 'app/Components/Form/FormSection'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import ReduxFormSwitch from 'app/Components/Form/ReduxFormSwitch'
import { FullPageViewToolbar } from 'app/Components/FullPageView'
import Button from 'app/Components/Button'
import HelmetTitle from 'app/Components/HelmetTitle'

import { IdentityEditFormBasicInfo } from '../components/BasicInfo'

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
    <Field
      tabIndex={13}
      name='forwardOptionPrefixOrigin'
      component={ReduxFormSwitch}
      label={p.fm(m.app.Identity.forwardOptionPrefixOrigin)}
    />
    <Field
      tabIndex={14}
      name='forwardOptionIncludeGPG'
      component={ReduxFormSwitch}
      label={p.fm(m.app.Identity.forwardOptionIncludeGPG)}
    />
    <Field
      tabIndex={15}
      name='forwardOptionIncludeSMIME'
      component={ReduxFormSwitch}
      label={p.fm(m.app.Identity.forwardOptionIncludeSMIME)}
    />
  </div>
)

class IdentityVCardUpload extends Component {
  static propTypes = {
    identityId: PropTypes.number,
    userAccessId: PropTypes.string,
    userSecretToken: PropTypes.string
  }

  constructor (props) {
    super(props)

    this._handleVCardDrop = this._handleVCardDrop.bind(this)

    this.state = {
      successfulCount: null,
      error: null,
      inProgress: false
    }
  }

  _handleVCardDrop (files) {
    if (!files || !files.length) return

    promiseBinaryDataFromFile(files[0])
    .then((data) => {
      this.setState({
        successfulCount: null,
        error: null,
        inProgress: true
      })

      const signature = createSignature(this.props.userAccessId, this.props.userSecretToken)

      let r = request('POST', `${api.config.httpUrl}/identities/${this.props.identityId}/vcard`)
      r.set('Content-Type', 'application/octet-stream')
      r.set('X-MsgSafe-NewApp', '1')
      r.set('X-MsgSafe-Signed', signature)
      r.send(data).end((err, res) => {
        if (err) {
          this.setState({
            successfulCount: null,
            error: err,
            inProgress: false
          })
        }

        this.setState({
          successfulCount: (res.vcards || []).length,
          error: null,
          inProgress: false
        })
      })
    })

  }

  render () {
    return (
      <span>
        <Dropzone onDrop={this._handleVCardDrop} className='link-dropzone' disablePreview>
          <FormattedMessage {...m.app.Identity.clickToImportVCard} />
        </Dropzone>

        { !this.state.inProgress ? null : <FACircleONotch className='link-dropzone__spinner spinning' /> }
        { !this.state.error ? null : <span className='link-dropzone__error'>{this.state.error.message}</span> }
        { typeof this.state.successfulCount === 'number' ? (
          <span className='link-dropzone__success'>
            <FormattedMessage {...m.app.Identity.vCardsUploaded} values={{nCount: this.state.successfulCount}} />
          </span>
        ) : null}
      </span>
    )
  }
}

export class EditIdentity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object,

    data: PropTypes.object,
    avatarImage: PropTypes.string,
    timezone: PropTypes.string,

    className: PropTypes.string,
    region: PropTypes.object.isRequired,
    editIdentity: PropTypes.func.isRequired,
    userEmail: PropTypes.object.isRequired,
    fetchUserEmails: PropTypes.func.isRequired,
    setUserEmailSearchQuery: PropTypes.func.isRequired,
    clearUserEmailSearchData: PropTypes.func.isRequired,
    userAccessId: PropTypes.string,
    userSecretToken: PropTypes.string,

    forwardEmail: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentDidMount () {
    ax.form.editPageView(ax.EVENTS.IDENTITY_FORM)
  }

  componentWillMount () {
    if (!this.props.data) {
      history.push('/identity')
      return
    }

    const { userEmail, fetchUserEmails } = this.props

    if (!userEmail.data || !userEmail.dataOrder) fetchUserEmails()
  }

  componentWillUnmount () {
    this.props.clearUserEmailSearchData()
  }

  _handleSubmit (values) {
    let p = {
      id: this.props.data.id,
      display_name: values.displayName,
      region: values.countryOfOrigin,
      email_signature: values.emailSignature,
      // encrypt_contact_email_pgp: values.defaultEncryptionGPG,
      // encrypt_contact_email_smime: values.defaultEncryptionSMIME,
      strip_html: values.stripHTML,
      two_factor_send: values.twoFactorSend,
      auto_create_contact: !values.blockNewContacts,
      http_pickup: !values.forwardEmail,
      encrypt_esp_pgp: values.forwardOptionIncludeGPG,
      encrypt_esp_smime: values.forwardOptionIncludeSMIME,
      next_hop_exit: values.forwardEmail,
      country_flag_emoji: values.forwardOptionPrefixOrigin,
      include_signature_reply: values.includeSignatureReplyForward,
      include_signature_compose: values.includeSignatureCompose
    }

    if (values.forwardEmail && values.forwardToESP) {
      p.useremail_id = values.forwardToESP
    }

    return new Promise((resolve, reject) => this.props.editIdentity(p, resolve, reject))
  }

  render () {
    if (!this.props.data) return null

    const { data, className, avatarImage, submitting, handleSubmit, region, userEmail, forwardEmail, timezone } = this.props
    const fm = this.props.intl.formatMessage

    return (
      <div className={`${className} edit-view edit-view--with-detail-top-bar-spacing`}>
        <HelmetTitle titleTrans={m.app.Identity.editTitle} />
        <EditViewHeader data={data} avatarImage={avatarImage} timezone={timezone} />
        <form className={`z-form z-form--alpha`} onSubmit={handleSubmit(this._handleSubmit)}>
          <div className='edit-view__body edit-view__body--fluid'>
            <FormSection disableToggle withTopBorder>
              <div className='z-form__grid'>
                <div className='z-form__two-of-three'>
                  <Field
                    tabIndex={1}
                    type='text'
                    name='displayName'
                    component={ReduxFormTextInput}
                    label={fm(m.app.Common.displayName)}
                    helpText={fm(m.app.Identity.displayNameHelp)}
                  />
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
            </FormSection>

            <IdentityEditFormBasicInfo />

            <FormSection
              withTopBorder
              initiallyVisible
              title={fm(m.app.Identity.importVCardTitle)}
            >
              <div className='z-help'>
                <FormattedMessage {...m.app.Identity.importVCardHelp} />{' '}
                <IdentityVCardUpload
                  identityId={this.props.data.id}
                  userAccessId={this.props.userAccessId}
                  userSecretToken={this.props.userSecretToken}
                />
              </div>
            </FormSection>

            <FormSection
              title={fm(m.app.Identity.emailSignature)}
              withTopBorder
            >
              <Field
                tabIndex={3}
                name='includeSignatureCompose'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.includeSignatureCompose)}
              />
              <Field
                tabIndex={4}
                name='includeSignatureReplyForward'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.includeSignatureReplyForward)}
              />
              <Field
                tabIndex={5}
                rows={36}
                type='textarea'
                name='emailSignature'
                component={ReduxFormTextInput}
              />
            </FormSection>

            {/*
            <FormSection
              title={fm(m.app.Identity.defaultEncryptionStandardTitle)}
              initiallyVisible
              withTopBorder
            >
              <Field
                tabIndex={6}
                name='defaultEncryptionGPG'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.defaultEncryptionGPG)}
              />
              <Field
                tabIndex={7}
                name='defaultEncryptionSMIME'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.defaultEncryptionSMIME)}
                helpText={fm(m.app.Identity.defaultEncryptionStandardHelp)}
              />
            </FormSection>
            */}

            <FormSection
              title={fm(m.app.Identity.emailBlockingPostProcessingTitle)}
              initiallyVisible
              withTopBorder
            >
              <Field
                tabIndex={8}
                name='stripHTML'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.stripHTML)}
                helpText={fm(m.app.Identity.stripHTMLHelp)}
              />
              <Field
                tabIndex={9}
                name='blockNewContacts'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.blockNewContacts)}
                helpText={fm(m.app.Identity.blockNewContactsHelp)}
              />
              <Field
                tabIndex={10}
                name='twoFactorSend'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.twoFactorSend)}
                helpText={fm(m.app.Identity.twoFactorSendHelp)}
              />
            </FormSection>

            <FormSection
              title={fm(m.app.Identity.emailForwardingTitle)}
              initiallyVisible
              withTopBorder
            >
              <Field
                tabIndex={11}
                name='forwardEmail'
                component={ReduxFormSwitch}
                label={fm(m.app.Identity.forwardEmail)}
                helpText={fm(m.app.Identity.forwardEmailHelp)}
              />
              { !forwardEmail ? null : (
                <ForwardEmail
                  fm={fm}
                  userEmail={userEmail}
                  setUserEmailSearchQuery={this.props.setUserEmailSearchQuery}
                />
              )}
            </FormSection>

          </div>
          <FullPageViewToolbar contentRight>
            <Button
              tabIndex={16}
              btnStyle='success'
              inProgress={submitting}
              type='submit'
            >
              <FormattedMessage {...m.app.Common.saveChanges} />
            </Button>
            <Button onClick={history.goBack} type='button'>
              <FormattedMessage {...m.app.Common.cancel} />
            </Button>
          </FullPageViewToolbar>
        </form>
      </div>

    )
  }
}

const validator = createValidator({
  displayName: [
    i18nize(required, m.app.IdentityValidation.displayNameRequired),
    i18nize(minLength, m.app.IdentityValidation.displayNameMinLength, [4])
  ],
  countryOfOrigin: [
    i18nize(required, m.app.CommonValidation.thisCannotBeEmpty)
  ],
  forwardToESP: [
    i18nize(invalidIf, m.app.IdentityValidation.forwardEspIsRequired, [(value, data) => {
      return data['forwardEmail'] && !data['forwardToESP']
    }])
  ]
})

const FORM_IDENTIFIER = 'editIdentity'
const EditIdentityForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: validator
})(EditIdentity)

const mapStateToProps = (state, ownProps) => {
  const props = {
    userAccessId: state.user.data.access_id,
    userSecretToken: state.user.data.secret_token,
    region: extractRegionDataFromUser(state.user, CountryLabel),
    userEmail: extractUserEmailData(state.usableUserEmail),
    forwardEmail: getReduxFormValue(state, FORM_IDENTIFIER, 'forwardEmail'),
    timezone: state.user.data.timezone
  }

  const { data } = getActiveDataFromStoreSlice(state.identity)
  const item = (data && ownProps.params.id) ? data[ownProps.params.id] : null

  if (item) {
    props.data = item
    props.avatarImage = path(['avatar', 'emails', item.email], state)
    props.initialValues = {
      displayName: item.display_name,
      countryOfOrigin: item.region,
      email: item.email,
      forwardOptionPrefixOrigin: item.country_flag_emoji,
      // defaultEncryptionGPG: item.encrypt_contact_email_pgp,
      // defaultEncryptionSMIME: item.encrypt_contact_email_smime,
      stripHTML: item.strip_html,
      blockNewContacts: !item.auto_create_contact,
      twoFactorSend: item.two_factor_send,
      forwardOptionIncludeGPG: item.encrypt_esp_pgp,
      forwardOptionIncludeSMIME: item.encrypt_esp_smime,
      emailSignature: item.email_signature,
      forwardEmail: !item.http_pickup,
      forwardToESP: item.useremail_id,
      includeSignatureReplyForward: item.include_signature_reply,
      includeSignatureCompose: item.include_signature_compose
    }
  }

  return props
}

const mapDispatchToProps = {
  editIdentity: IdentityActions.identityEdit,
  fetchUserEmails: UsableUserEmailActions.usableUserEmailFetch,
  clearUserEmailSearchData: UsableUserEmailActions.usableUserEmailClearSearchData,
  setUserEmailSearchQuery: UsableUserEmailActions.usableUserEmailSetSearchQuery,
}

const IntlInjected = injectIntl(EditIdentityForm)
const CEditIdentity = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export default CEditIdentity
