import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import Actions from 'commons/Redux/UserEmailRedux'
import { createValidator, i18nize, required, email } from 'commons/Lib/Validators'

import Button from 'app/Components/Button'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import HelmetTitle from 'app/Components/HelmetTitle'

export class ForwardAddress extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    error: PropTypes.string,
    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    createUserEmail: PropTypes.func
  }

  constructor (props) {
    super(props)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentDidMount () {
    ax.form.createPageView(ax.EVENTS.FORWARD_ADDRESS_FORM)
  }

  _handleSubmit (values) {
    let p = {
      display_name: values.name,
      email: values.email
    }
    return new Promise((resolve, reject) => this.props.createUserEmail(p, resolve, reject))
  }

  render () {
    const { submitting, handleSubmit, intl, error } = this.props

    return (
      <FullPageView
        title={intl.formatMessage(m.app.ForwardAddress.createTitle)}
        className='forwardaddress-container'
      >
        <HelmetTitle titleTrans={m.app.ForwardAddress.createTitle} />
        <form className='edit-view z-form z-form--alpha' onSubmit={handleSubmit(this._handleSubmit)}>
          <div className='edit-view__body'>
            <Field
              tabIndex={1}
              type='text'
              name='name'
              placeholder='John Doe'
              component={ReduxFormTextInput}
              label={intl.formatMessage(m.app.Common.displayName)}
              helpText={intl.formatMessage(m.app.ForwardAddress.displayNameHelp)}
            />
            <Field
              tabIndex={2}
              type='text'
              name='email'
              placeholder='johndoe@domain.com'
              component={ReduxFormTextInput}
              label={intl.formatMessage(m.app.Common.emailAddress)}
              helpText={intl.formatMessage(m.app.ForwardAddress.emailAddressHelp)}
            />
            { error && <div className='z-form__error z-form__error-large text-center'>{error}</div> }
          </div>

          <FullPageViewToolbar contentRight>
            <Button
              tabIndex={3}
              btnStyle='success'
              inProgress={submitting}
              type='submit'
            >
              <FormattedMessage {...m.app.Common.next} />
            </Button>
          </FullPageViewToolbar>
        </form>
      </FullPageView>
    )
  }
}

const validator = createValidator({
  name: [
    i18nize(required, m.app.CommonValidation.displayNameRequired)
  ],
  email: [
    i18nize(required, m.app.CommonValidation.emailRequired),
    i18nize(email, m.app.CommonValidation.emailInvalid)
  ]
})

const FORM_IDENTITIFER = 'forwardAddress'
const ForwardAddressForm = reduxForm({
  form: FORM_IDENTITIFER,
  validate: validator
})(ForwardAddress)

const mapDispatchToProps = {
  createUserEmail: Actions.useremailCreate
}

const IntlInjected = injectIntl(ForwardAddressForm)
const CForwardAddress = connect(null, mapDispatchToProps)(IntlInjected)

export const CreateForwardAddressRoute = {
  components: { children: CForwardAddress, hideNav: 'true' },
  path: '/esp/new'
}
