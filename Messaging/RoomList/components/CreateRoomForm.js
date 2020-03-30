import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape, injectIntl } from 'react-intl'
import { reduxForm, Field } from 'redux-form'
import debounce from 'debounce'
import { path, find, propEq } from 'ramda'
import { isEmail } from 'validator'

import m from 'commons/I18n'
import { createValidator, i18nize, required } from 'commons/Lib/Validators'
import IdentityActions from 'commons/Redux/IdentityRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import { getReduxFormValue } from 'commons/Selectors/ReduxForm'
import { getActiveDataFromStoreSlice } from 'commons/Redux/_Utils'

import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import Button from 'app/Components/Button'

import {
  CREATE_ROOM_FORM_IDENTIFIER,
  ROOM_TYPE_EPHEMERAL
} from '../../constants'

class CreateRoom extends PureComponent {

  static propTypes = {
    roomType: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired,
    intl: intlShape,

    // Contact
    contact: PropTypes.object,
    setContactSearchQuery: PropTypes.func.isRequired,
    contactSetSearchFilters: PropTypes.func.isRequired,

    // Identity
    identity: PropTypes.object,
    fetchIdentities: PropTypes.func.isRequired,
    setIdentitySearchQuery: PropTypes.func.isRequired,

    // Room action
    chatCreateRoomRequest: PropTypes.func.isRequired,

    // Selected contact and identity
    selectedContact: PropTypes.object,
    selectedIdentity: PropTypes.object,

    // redux-form
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
    this._getContactData = this._getContactData.bind(this)
    this._getIdentityData = this._getIdentityData.bind(this)
    this.setIdentitySearchQuery = debounce(props.setIdentitySearchQuery, 300)
    this.setContactSearchQuery = debounce(props.setContactSearchQuery, 300)

    this.state = {
      customContactEmail: null
    }
  }

  _handleSubmit (values) {
    const { onRequestClose } = this.props
    onRequestClose()
    this.props.chatCreateRoomRequest(
      this.props.selectedIdentity.email,
      this.props.selectedIdentity.display_name,
      values.contact,
      false
    )
  }

  _getContactData () {
    const { searchResultsData, searchResultsDataOrder } = this.props.contact
    const { customContactEmail } = this.state

    let data = searchResultsData || {}
    let dataOrder = searchResultsDataOrder ? searchResultsDataOrder.asMutable() : []

    const finalData = dataOrder.map(id => ({
      value: id,
      label: data && data[id] && data[id].display_name !== id ? `${data[id].display_name} <${id}>` : id
    }))

    // If user has entered a custom contact email, add it to options list
    if (customContactEmail) {
      finalData.unshift({
        className: 'Select-create-option-placeholder',
        value: customContactEmail,
        label: customContactEmail
      })
    }

    return finalData
  }

  _getIdentityData () {
    const { data, dataOrder } = getActiveDataFromStoreSlice(this.props.identity)
    const { selectedContact } = this.props

    let identities

    if (selectedContact && selectedContact.identities) {
      identities = selectedContact.identities
    }

    if (identities) {
      return ((identities && identities.asMutable()) || []).map(rec => ({
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

  componentDidMount () {
    const { identity, fetchIdentities } = this.props
    this.props.contactSetSearchFilters({ is_msgsafe_user: true })

    // fetch identities if not fetched yet
    if ((!identity.data || !identity.dataOrder) && !identity.dataRequestInProgress) {
      fetchIdentities()
    }
  }

  componentWillUnmount () {
    this.props.contactSetSearchFilters({})
  }

  componentWillReceiveProps (nextProps) {
    // Fetch specific contacts for a given identity
    if (this.props.selectedIdentity !== nextProps.selectedIdentity) {
      if (nextProps.selectedIdentity) {
        this.props.contactSetSearchFilters({
          is_msgsafe_user: true,
          identity_id: nextProps.selectedIdentity.id
        })
      } else {
        // If they had a previous contact list specific to identity, but then cleared
        // the identity, reset To/Contacts.
        this.props.contactSetSearchFilters({
          is_msgsafe_user: true
        })
      }
    }
  }

  render () {
    const {
      intl,
      contact,
      identity,
      handleSubmit,
      invalid
    } = this.props
    const fm = intl.formatMessage
    let message = m.app.Chat.startEncryptedChat
    if (this.props.roomType === ROOM_TYPE_EPHEMERAL) {
      message = m.app.Chat.startEphemeralChat
    }
    return (
      <form className='z-form z-form--simple z-form--horizontal' onSubmit={handleSubmit(this._handleSubmit)} >
        <div className='msging__create-room__txt'>
          {fm(message, { msgsafe: 'MsgSafe.io' })}
        </div>
        <Field
          tabIndex={1}
          name='contact'
          label={fm(m.app.Chat.chatWith)}
          component={ReduxFormSelect}
          options={this._getContactData()}
          isLoading={contact.dataRequestInProgress}
          searchForQuery={this.setContactSearchQuery}
          noResultsText={fm(contact.dataRequestInProgress ? m.app.Common.loadingEllipses : m.app.Contact.contactNotFoundTypeToCreate)}
          placeholder=' '
          allowCustom
          promptTextCreator={label => intl.formatMessage(m.app.Mailbox.useEmailAddress, {eMail: label})}
          isValidNewOption={({label}) => isEmail(label || '')}
          onNewOptionClick={({label}) => this.setState({ customContactEmail: label })}
          onChangeCb={email => !email && this.setState({ customContactEmail: null })}
        />
        <Field
          tabIndex={2}
          name='identity'
          label={fm(m.app.Chat.chatAs)}
          component={ReduxFormSelect}
          options={this._getIdentityData()}
          isLoading={identity.dataRequestInProgress}
          searchForQuery={this.setIdentitySearchQuery}
          noResultsText={fm(identity.dataRequestInProgress ? m.app.Common.loadingEllipses : m.app.Identity.identityNotFound)}
          placeholder=' '
        />
        <Button
          className='msging__create-room__submit'
          type='submit'
          small
          btnStyle='success'
          disabled={invalid}
        >
          {fm(m.app.Chat.start)}
        </Button>
      </form>
    )
  }
}

const mapStateToProps = state => {
  // extract selected identity id and contact email
  const selectedIdentityId = getReduxFormValue(state, CREATE_ROOM_FORM_IDENTIFIER, 'identity')
  const selectedContactEmail = getReduxFormValue(state, CREATE_ROOM_FORM_IDENTIFIER, 'contact')

  let selectedContact = null
  let selectedIdentity = null

  if (selectedContactEmail) {
    selectedContact = path(['contact', 'searchResultsData', selectedContactEmail], state) ||
      path(['contact', 'data', selectedContactEmail], state)
  }

  if (selectedIdentityId) {
    selectedIdentity = path(['identity', 'searchResultsData', selectedIdentityId], state) ||
      path(['identity', 'data', selectedIdentityId], state)

    if (!selectedIdentity && selectedContact) {
      selectedIdentity = find(propEq('id', selectedIdentityId))(selectedContact.identities)
    }
  }

  return {
    contact: state.contact,
    identity: state.identity,
    selectedContact: selectedContact,
    selectedIdentity: selectedIdentity
  }
}

const mapDispatchToProps = {
  // Identity
  fetchIdentities: IdentityActions.identityFetch,
  setIdentitySearchQuery: IdentityActions.identitySetSearchQuery,
  identityClearSearchData: IdentityActions.identityClearSearchData,

  // Contact
  contactSetSearchFilters: ContactActions.contactSetSearchFilters,
  setContactSearchQuery: ContactActions.contactSetSearchQuery,
  contactClearSearchData: ContactActions.contactClearSearchData,

  // Chat
  chatCreateRoomRequest: ChatActions.chatCreateRoomRequest,
  canMemberChat: ChatActions.canMemberChatRequest
}

const validate = createValidator({
  identity: [i18nize(required, m.app.Chat.identityRequired)],
  contact: [i18nize(required, m.app.Chat.contactRequired)]
})

// Async validator that checks if contact email is a msgsafe user
// and can chat
const chatRoomFormAsyncValidator = (values, dispatch, props) => {
  // If contact is present, validate it
  if (values.contact) {
    return new Promise((resolve, reject) => {
      props.canMemberChat(
        { email: values.contact },
        response => response && response.status && resolve(),
        () => reject({'contact': props.intl.formatMessage(m.app.Chat.contactCannotChat)})
      )
    })
  }

  // return a resolved promise as required by redux-form
  return Promise.resolve()
}

const CreateRoomForm = reduxForm({
  form: CREATE_ROOM_FORM_IDENTIFIER,
  validate,
  asyncBlurFields: ['contact'],
  asyncValidate: chatRoomFormAsyncValidator
})(CreateRoom)

const ConnectedCreateRoomModal = connect(mapStateToProps, mapDispatchToProps)(CreateRoomForm)

const InjectedCreateRoomModal = injectIntl(ConnectedCreateRoomModal)

export default InjectedCreateRoomModal
