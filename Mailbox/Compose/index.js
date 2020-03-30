import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { isEmail } from 'validator'
import { path } from 'ramda'
import Dropzone from 'react-dropzone'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import FATimes from 'react-icons/lib/fa/times-circle'
import FAPaperclip from 'react-icons/lib/fa/paperclip'
import draftToHtml from 'draftjs-to-html'
import ContentState from 'draft-js/lib/ContentState'
import EditorState from 'draft-js/lib/EditorState'
import convertToRaw from 'draft-js/lib/convertFromDraftStateToRaw'
import Link from 'react-router/lib/Link'
import debounce from 'debounce'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import IdentityActions from 'commons/Redux/IdentityRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'
import UserActions from 'commons/Redux/UserRedux'
import { promiseBase64FromFile } from 'commons/Lib/FileReader'
import { getActiveDataFromStoreSlice } from 'commons/Redux/_Utils'
import { makeReplyBody, makeForwardBody } from 'commons/Lib/Mail'
import { isPendingOnboard } from 'commons/Selectors/User'
import { getReduxFormValue } from 'commons/Selectors/ReduxForm'
import { createValidator, i18nize, required, email } from 'commons/Lib/Validators'
import log from 'commons/Services/Log'

import history from 'app/Routes/History'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormCheckbox from 'app/Components/Form/ReduxFormCheckbox'
import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import Button from 'app/Components/Button'
import HelmetTitle from 'app/Components/HelmetTitle'
import ConfirmDialog from 'app/Components/ConfirmDialog'
// import hotkey from 'react-hotkey'
import Editor from './components/Editor'

const EncryptionDefaultState = {
  DISABLED: 1,
  ON: 2,
  OFF: 3
}

const MailboxSelectOption = ({ value, name, label }) => (
  <div key={value}>
    {name && <div className='mailbox-compose__identity-select-option__name'>{name}</div>}
    <div className='mailbox-compose__identity-select-option__email'>{label}</div>
  </div>
)
// hotkey.activate('keydown')

MailboxSelectOption.propTypes = {
  value: PropTypes.any,
  name: PropTypes.string,
  label: PropTypes.string
}

class _MailboxComposeForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    identity: PropTypes.object,
    contact: PropTypes.object,
    fetchIdentities: PropTypes.func,
    fetchContacts: PropTypes.func,
    refreshProfile: PropTypes.func,
    sendMail: PropTypes.func,
    setIdentitySearchQuery: PropTypes.func,
    setContactSearchQuery: PropTypes.func,
    identityClearSearchData: PropTypes.func,
    contactClearSearchData: PropTypes.func,
    isGTMdScreen: PropTypes.bool,
    isPendingOnboard: PropTypes.bool,

    initialValues: PropTypes.object,
    params: PropTypes.object,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    valid: PropTypes.bool,
    error: PropTypes.string,
    change: PropTypes.func,

    gpgState: PropTypes.number,
    smimeState: PropTypes.number,

    identityContact: PropTypes.func,
    identitiesByContact: PropTypes.array,
    contactsByIdentity: PropTypes.object,
    currentSelectedIdentityId: PropTypes.number,

    fromIdentity: PropTypes.object, // current identity (from state.identity.data or state.identity.searchResultsData, or contacts.email.identities[]
    identityContactClear: PropTypes.func,

    customComposeContactEmail: PropTypes.string,
    setCustomComposeContactEmail: PropTypes.func,
    clearCustomComposeContactEmail: PropTypes.func,

    hasConfirmedEsp: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
    this._handleFileAdd = this._handleFileAdd.bind(this)
    this._renderEspRequired = this._renderEspRequired.bind(this)
    this._handleEspConfirmClose = this._handleEspConfirmClose.bind(this)
    this._handleEspConfirmAdd = this._handleEspConfirmAdd.bind(this)
    // this.hotkeyHandler = this.hotkeyHandler.bind(this)

    this._initialEditorState = EditorState.createWithContent(ContentState.createFromText(props.initialValues.body || ''))
    this._editorState = this._initialEditorState
    this._setEditorState = state => { this._editorState = state }

    this.setIdentitySearchQuery = debounce(this.props.setIdentitySearchQuery, 300)
    this.setContactSearchQuery = debounce(this.props.setContactSearchQuery, 300)

    this.state = {
      files: [],
      profileUpdateSuccess: false
    }

    if (!this.props.hasConfirmedEsp) {
      const {refreshProfile} = this.props
      if (!refreshProfile) return

      refreshProfile({}, () => {
        this.setState({profileUpdateSuccess: true})
      })
    }
  }

  // hotkeyHandler (e) {
  //   switch (e.key) {
  //     case 'Escape':
  //       history.goBack()
  //       break
  //     case 'Enter':
  //       if (e.metaKey || e.ctrlKey) {
  //         e.preventDefault()
  //         this.props.handleSubmit(this._handleSubmit)
  //       }
  //       break
  //   }
  // }

  _getIdentityData () {
    const { data, dataOrder, isSearchData } = getActiveDataFromStoreSlice(this.props.identity)
    const { identitiesByContact } = this.props

    if (identitiesByContact && !isSearchData) {
      return ((identitiesByContact && identitiesByContact.asMutable()) || []).map(rec => ({
        value: rec.id,
        name: rec.display_name,
        label: rec.display_name !== rec.email ? `${rec.display_name} <${rec.email}>` : rec.email
      }))
    }

    return ((dataOrder && dataOrder.asMutable()) || []).map(id => ({
      value: id,
      name: data[id].display_name,
      label: data[id].display_name !== data[id].email ? `${data[id].display_name} <${data[id].email}>` : data[id].email
    }))
  }

  _getContactData () {
    const { data, dataOrder, isSearchData } = getActiveDataFromStoreSlice(this.props.contact)
    const { contactsByIdentity, customComposeContactEmail } = this.props

    let contactData = data

    if (contactsByIdentity && contactsByIdentity.data && !isSearchData) {
      const isAvail = path(['data', 'contacts'], contactsByIdentity)
      if (isAvail) {
        const clist = contactsByIdentity.data.contacts
        contactData = ((clist && clist.asMutable()) || []).map(rec => ({
          value: rec.email,
          name: rec.display_name,
          label: rec.display_name !== rec.email ? `${rec.display_name} <${rec.email}>` : rec.email
        }))
      }
    }

    contactData = ((dataOrder && dataOrder.asMutable()) || []).map(id => ({
      value: id,
      label: contactData && contactData[id] && contactData[id].display_name !== id ? `${contactData[id].display_name} <${id}>` : id
    }))

    if (customComposeContactEmail) {
      contactData.unshift({
        className: 'Select-create-option-placeholder',
        value: customComposeContactEmail,
        label: customComposeContactEmail
      })
    }

    return contactData
  }

  _handleSubmit (values) {
    const { sendMail, submitting, submitSucceeded, identity, fromIdentity } = this.props

    if (submitting || submitSucceeded) return

    const htmlMessage = draftToHtml(convertToRaw(this._editorState.getCurrentContent()))

    const payload = {
      identity_id: values.identity,
      msg_subject: values.subject,
      msg_body: htmlMessage,
      msg_to: values.email,
      save_webmail: true,
      disable_pgp: !values.pgp,
      disable_smime: !values.smime,
      attach_pgp: values.attach_pgp,
      attach_smime: values.attach_smime,
      isTwoFactorSend: false
    }

    try {
      if (identity && identity.data && values.identity) {
        if (identity.data[values.identity]) {
          payload['isTwoFactorSend'] = identity.data[values.identity].two_factor_send
        } else if (fromIdentity) {
          payload['isTwoFactorSend'] = fromIdentity.two_factor_send
        }
      }
    } catch (e) {
      log.debug('_handleSubmit caught -', e)
    }

    return new Promise((resolve, reject) => {
      if (this.state.files && this.state.files.length > 0) {
        Promise.all(
          this.state.files.map(file =>
            promiseBase64FromFile(file)
            .then(data => ({
              name: file.name,
              type: file.type,
              data: data
            }))
          )
        )
        .then(files => {
          payload['msg_files'] = files
          sendMail(payload, resolve, reject)
        })
      } else {
        sendMail(payload, resolve, reject)
      }
    })
  }

  _handleFileAdd (files) {
    this.setState({
      files: this.state.files.concat(files)
    })
  }

  _handleFileRemoval (index) {
    this.setState({
      files: [
        ...this.state.files.slice(0, index),
        ...this.state.files.slice(index + 1)
      ]
    })
  }

  _renderAttachments () {
    const files = this.state.files.map((f, index) => (
      <div className='mailbox-compose__attachment' key={index}>
        <FATimes className='mailbox-compose__attachment__delete' onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          this._handleFileRemoval(index)
        }} />
        <span className='mailbox-compose__attachment__filename'>{f.name}</span>
      </div>
    ))

    return (
      <Dropzone onDrop={this._handleFileAdd} className='mailbox-compose__dropzone' disablePreview>
        <div>
          <FAPaperclip className='mailbox-compose__dropzone-icon' />
          {
            files.length
              ? files
              : (
                <div className='mailbox-compose__dropzone-txt'>
                  <FormattedMessage {...(this.props.isGTMdScreen ? m.app.Mailbox.addAttachmentFullMessage : m.app.Mailbox.addAttachmentMessage)} />
                </div>
              )
          }
        </div>
      </Dropzone>
    )
  }

  _renderEncryptionOptions () {
    if (
      this.props.gpgState === EncryptionDefaultState.DISABLED &&
      this.props.smimeState === EncryptionDefaultState.DISABLED
    ) {
      const transContact = <FormattedMessage {...m.app.Contact.contacts} />
      return (
        <div className='mailbox-compose__encrypt-with'>
          <span className='mailbox-compose__encrypt-with__text-gray'>
            <FormattedMessage
              {...m.app.Mailbox.encryptWithNeedsKeys}
              values={{contactsLink: <Link to='/contact'>{transContact}</Link>}}
            />
          </span>
        </div>
      )
    } else {
      return (
        <div className='mailbox-compose__encrypt-with'>
          <span className='mailbox-compose__encrypt-with__text'>
            <FormattedMessage {...m.app.Mailbox.encryptWithLabel} />
          </span>

          <Field
            name='pgp'
            label='GPG'
            component={ReduxFormCheckbox}
            disabled={this.props.gpgState === EncryptionDefaultState.DISABLED}
          />

          <Field
            name='smime'
            label='S/MIME'
            component={ReduxFormCheckbox}
            disabled={this.props.smimeState === EncryptionDefaultState.DISABLED}
          />
        </div>
      )
    }
  }

  _renderEncryptionSignOptions () {
    return (
      <div className='mailbox-compose__encrypt-with mailbox-compose__encrypt-with--right'>
        <span className='mailbox-compose__encrypt-with__text'>
          <FormattedMessage {...m.app.Mailbox.attachPublicKeyLabel} />
        </span>

        <Field
          name='attach_pgp'
          label='GPG'
          component={ReduxFormCheckbox}
        />
        <Field
          name='attach_smime'
          label='S/MIME'
          component={ReduxFormCheckbox}
        />
      </div>
    )
  }

  componentWillMount () {
    if (this.props.isPendingOnboard) {
      history.push('/identity/new')
      return
    }

    // If contact and/or identity has been set in initialValues
    // then set search query string for them so that the associated
    // record is fetched and is available for redux-select

    const { initialValues, setContactSearchQuery, setIdentitySearchQuery } = this.props

    if (initialValues.email) {
      setContactSearchQuery(initialValues.email)
    }

    if (initialValues.identityEmail) {
      setIdentitySearchQuery(initialValues.identityEmail)
    }
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.MAILBOX_COMPOSE)

    const { identity, contact, fetchIdentities, fetchContacts } = this.props

    if (!identity.data || !identity.dataOrder) {
      fetchIdentities()
    }

    if (!contact.data || !contact.dataOrder) {
      fetchContacts()
    }

    // hotkey.addHandler(this.hotkeyHandler)
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.submitSucceeded && nextProps.submitSucceeded) {
      history.push('/mailbox')
      return
    }

    /* Fetch specific contacts for a given identity */
    if (this.props.currentSelectedIdentityId !== nextProps.currentSelectedIdentityId) {
      if (nextProps.currentSelectedIdentityId) {
        const p = { filter: { identity_id: nextProps.currentSelectedIdentityId } }
        const action = this.props.identityContact
        if (action) {
          return new Promise((resolve, reject) => action(p, resolve, reject))
        }
      } else {
        /* If they had a previous contact list specific to identity, but then cleared
         * the identity, reset To/Contacts.
         */
        if (nextProps.contactsByIdentity) {
          if (!nextProps.currentSelectedIdentityId) {
            this.props.identityContactClear()
          }
        }
      }
    }

    if (this.props.gpgState !== nextProps.gpgState) {
      this.props.change('pgp', nextProps.gpgState === EncryptionDefaultState.ON)
    }

    if (this.props.smimeState !== nextProps.smimeState) {
      this.props.change('smime', nextProps.smimeState === EncryptionDefaultState.ON)
    }

    /**
     * If user has only one identity auto select From field.
     * But do it once, because otherwise user cannot edit the
     * "From" field.
     */
    const identities = this._getIdentityData()
    if (identities.length === 1 && !this._autoSelectedFromFieldOnce) {
      this.props.change('identity', identities[0].value)
      this._autoSelectedFromFieldOnce = true
    }
  }

  componentWillUnmount () {
    this.props.identityClearSearchData()
    this.props.contactClearSearchData()
    this.props.identityContactClear()
    this.props.clearCustomComposeContactEmail()

    // hotkey.removeHandler(this.hotkeyHandler)
  }

  _renderEspRequired () {
    const { intl } = this.props
    const fm = intl.formatMessage
    return (
      <ConfirmDialog
        headerText={fm(m.app.Mailbox.espNotConfirmed)}
        bodyText={fm(m.app.Mailbox.espRequiredToSend)}
        cancelButtonText={fm(m.app.Common.close)}
        confirmButtonText={fm(m.app.Mailbox.addEmailAddress)}
        confirmHandler={this._handleEspConfirmAdd}
        cancelHandler={this._handleEspConfirmClose}
        dialogButton={<Button>NoOp</Button>}
        isOpened
      />
    )
  }

  _handleEspConfirmClose () {
    history.goBack()
  }

  _handleEspConfirmAdd () {
    history.replace('/esp/new')
  }

  render () {
    const {
      identity,
      contact,
      intl,
      handleSubmit,
      submitting,
      isGTMdScreen,
      error,
      hasConfirmedEsp
    } = this.props

    const sendButton = (
      <Button
        tabIndex={4}
        btnStyle='success'
        type='submit'
        inProgress={submitting}
        small={!isGTMdScreen}
        onClick={handleSubmit(this._handleSubmit)}
      ><FormattedMessage {...m.app.Mailbox.send} /></Button>
    )

    return (
      <FullPageView title={intl.formatMessage(m.app.Mailbox.compose)} rightContent={!isGTMdScreen && sendButton}>
        <HelmetTitle titleTrans={m.app.Mailbox.compose} />
        <div className='mailbox-compose'>
          <form className='z-form z-form--simple z-form--horizontal' onSubmit={handleSubmit(this._handleSubmit)}>
            <div className='mailbox-compose__upper-body'>

              <Field
                tabIndex={1}
                name='email'
                label={intl.formatMessage(m.app.Mailbox.to)}
                component={ReduxFormSelect}
                options={this._getContactData()}
                isLoading={contact.dataRequestInProgress}
                searchForQuery={this.setContactSearchQuery}
                noResultsText={intl.formatMessage(contact.dataRequestInProgress ? m.app.Common.loadingEllipses : m.app.Contact.contactNotFound)}
                placeholder=' '
                allowCustom
                promptTextCreator={label => intl.formatMessage(m.app.Mailbox.useEmailAddress, {eMail: label})}
                isValidNewOption={({label}) => isEmail(label || '')}
                onNewOptionClick={({label}) => this.props.setCustomComposeContactEmail(label)}
                onChangeCb={email => !email && this.props.clearCustomComposeContactEmail()}
              />

              <Field
                tabIndex={2}
                name='identity'
                label={intl.formatMessage(m.app.Mailbox.from)}
                component={ReduxFormSelect}
                placeholder=' '
                options={this._getIdentityData()}
                isLoading={identity.dataRequestInProgress}
                searchForQuery={this.setIdentitySearchQuery}
                optionRenderer={MailboxSelectOption}
              />

              <Field
                tabIndex={3}
                name='subject'
                label={intl.formatMessage(m.app.Mailbox.subject)}
                component={ReduxFormTextInput}
                placeholder=' '
              />

              <div className='clearfix' />

              { this._renderAttachments() }

              { this._renderEncryptionOptions() }

              { this._renderEncryptionSignOptions() }

              <div className='clearfix' />

              { !error ? null : <div className='z-form__error'>{error}</div> }
            </div>

            <Editor
              isGTMdScreen={isGTMdScreen}
              initialEditorState={this._initialEditorState}
              setEditorState={this._setEditorState}
            />
            <FullPageViewToolbar contentRight>
              {sendButton}
              <Button className='button' onClick={history.goBack}>
                <FormattedMessage {...m.app.Common.cancel} />
              </Button>
            </FullPageViewToolbar>
          </form>
        </div>
        {!hasConfirmedEsp && this.state.profileUpdateSuccess && this._renderEspRequired()}
      </FullPageView>
    )
  }
}

const FORM_IDENTIFIER = 'mailboxCompose'

const mapStateToProps = (state, ownProps) => {
  // Search or normal data set for mailbox
  const mailboxData = state.mailbox.searchResultsData || state.mailbox.data || {}

  // Build initial values for initializing redux-form
  let initialValues = {}
  const currentMailboxItem = ownProps.params.id && mailboxData[ownProps.params.id]

  if (ownProps.params.action === 'reply' && currentMailboxItem) {
    initialValues = {
      body: makeReplyBody(currentMailboxItem),
      subject: `Re: ${currentMailboxItem.msg_subject}`,
      identity: currentMailboxItem.identity_id,
      identityEmail: currentMailboxItem.msg_to,
      email: currentMailboxItem.msg_from
    }
  } else if (ownProps.params.action === 'forward' && currentMailboxItem) {
    initialValues = {
      body: makeForwardBody(currentMailboxItem),
      subject: `Fwd: ${currentMailboxItem.msg_subject}`,
      identity: currentMailboxItem.identity_id,
      identityEmail: currentMailboxItem.msg_to
    }
  } else if (ownProps.params.addr) {
    initialValues = {
      email: ownProps.params.addr
    }
  } else if (ownProps.params.inviteType) {
    const body = ownProps.params.inviteType === 'user'
      ? ownProps.intl.formatMessage(m.app.Mailbox.videoChatUserInvite)
      : ownProps.intl.formatMessage(
        m.app.Mailbox.videoChatGuestInvite,
        { url: `${window.location.origin}/secure/video/guest/${ownProps.params.to}/${ownProps.params.identityEmail}` }
      )
    initialValues = {
      email: ownProps.params.to,
      identityEmail: ownProps.params.identityEmail,
      identity: parseInt(ownProps.params.identityId),
      body: body
    }
  }

  let gpgState = EncryptionDefaultState.DISABLED
  let smimeState = EncryptionDefaultState.DISABLED

  // extract selected identity id and contact email
  const selectedIdentityId = getReduxFormValue(state, FORM_IDENTIFIER, 'identity')
  const selectedContactEmail = getReduxFormValue(state, FORM_IDENTIFIER, 'email')

  let contact = null
  let identity = null
  let identitiesByContact = null

  if (selectedContactEmail) {
    contact = path(['contact', 'searchResultsData', selectedContactEmail], state) ||
      path(['contact', 'data', selectedContactEmail], state)
  }

  if (selectedIdentityId) {
    identity = path(['identity', 'searchResultsData', selectedIdentityId], state) ||
      path(['identity', 'data', selectedIdentityId], state)

    if (!identity && selectedContactEmail) {
      const chkContact = path(['contact', 'data', selectedContactEmail], state)
      if (chkContact) {
        // Now we need to iterate all identities to find the id
        for (var i = 0; i < chkContact.identities.length; i++) {
          if (chkContact.identities[i].id === selectedIdentityId) {
            identity = chkContact.identities[i]
            break
          }
        }
      }
    }
  }

  // we MUST force the FROM dataset to available identities if a contact is selected
  if (contact) {
    identitiesByContact = contact.identities
  }

  // if both have been selected
  if (selectedIdentityId && selectedContactEmail) {
    // if contact has pgp public key
    if (contact && identity && contact.has_contact_email_pgp && identity.encrypt_contact_email_pgp) {
      gpgState = EncryptionDefaultState.ON
    }
    // if contact has smime public key
    if (contact && identity && contact.has_contact_email_smime && identity.encrypt_contact_email_smime) {
      smimeState = EncryptionDefaultState.ON
    }
  }

  return {
    gpgState: gpgState,
    smimeState: smimeState,
    isPendingOnboard: isPendingOnboard(state),
    identity: state.identity,
    contact: state.contact,
    initialValues: initialValues,
    isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),

    fromIdentity: identity,
    identitiesByContact: identitiesByContact,
    currentSelectedIdentityId: selectedIdentityId,
    contactsByIdentity: state.identity.api.identityContact,
    customComposeContactEmail: state.mailbox.customComposeContactEmail,

    hasConfirmedEsp: path(['user', 'data', 'has_confirmed_esp'], state)
  }
}

const mapDispatchToProps = {
  refreshProfile: UserActions.refreshProfileRequest,
  fetchIdentities: IdentityActions.identityFetch,
  setIdentitySearchQuery: IdentityActions.identitySetSearchQuery,
  identityClearSearchData: IdentityActions.identityClearSearchData,
  fetchContacts: ContactActions.contactFetch,
  setContactSearchQuery: ContactActions.contactSetSearchQuery,
  contactClearSearchData: ContactActions.contactClearSearchData,
  sendMail: MailboxActions.sendMailRequest,
  setCustomComposeContactEmail: MailboxActions.setCustomComposeContactEmail,
  clearCustomComposeContactEmail: MailboxActions.clearCustomComposeContactEmail,

  identityContact: IdentityActions.identityContactRequest,
  identityContactClear: IdentityActions.identityContactClear
}

const mailboxComposeFormValidator = createValidator({
  identity: [i18nize(required, m.app.MailboxValidation.identityRequired)],
  subject: [i18nize(required, m.app.MailboxValidation.subjectRequired)],
  body: [i18nize(required, m.app.MailboxValidation.bodyRequired)],
  email: [
    (value, ...args) =>
      i18nize(email, m.app.MailboxValidation.recipientEmailInvalid)(value || '', ...args),
    i18nize(required, m.app.MailboxValidation.recipientEmailRequired)
  ]
})

const _MailboxCompose = reduxForm({
  form: FORM_IDENTIFIER,
  validate: mailboxComposeFormValidator
})(_MailboxComposeForm)

export const MailboxCompose = connect(mapStateToProps, mapDispatchToProps)(_MailboxCompose)
const IntlInjected = injectIntl(MailboxCompose)

export const MailboxComposeRoute = {
  components: { children: IntlInjected, hideNav: 'true' },
  path: '/mailbox/new',
  childRoutes: [
    { path: '/mailbox/:id/:action' },
    { path: '/mailbox/new/to/:addr' },
    { path: '/secure/video/invite/:inviteType/:identityId/:identityEmail/:to' }
  ]
}
