import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import Link from 'react-router/lib/Link'

import m from 'commons/I18n/'
import UserActions from 'commons/Redux/UserRedux'
import { createValidator, i18nize, required, minLength, maxLength, accountPassword, equalTo } from 'commons/Lib/Validators'

import Button from 'app/Components/Button'
import FormSection from 'app/Components/Form/FormSection'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'

class PasswordChange extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    error: PropTypes.string,
    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,

    updateAccountRequest: PropTypes.func
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleSubmit (values) {
    return new Promise((resolve, reject) => this.props.updateAccountRequest({
      old_password: values.oldPassword,
      password: values.password
    }, resolve, reject))
  }

  render () {
    const { intl, handleSubmit, submitting, error } = this.props

    return (
      <form 
        onSubmit={handleSubmit(this._handleSubmit)}
        className='edit-view z-form z-form--alpha security-profile-container__pass-change'
      >
        <FormSection
          title={intl.formatMessage(m.app.Auth.password)}
          className='edit-view__body'
          initiallyVisible
          withTopBorder
        >
          { error && <div className='z-form__error z-form__error--large'>{error}</div> }
          <div className='z-form__grid'>
            <div className='z-form__one-of-two'>
              <Field
                tabIndex={1}
                type='password'
                name='oldPassword'
                component={ReduxFormTextInput}
                placeholder={intl.formatMessage(m.app.User.currentPassword)}
                smallLabel={intl.formatMessage(m.app.User.currentPassword)}
              />
            </div>
          </div>
          <div className='z-form__grid'>
            <div className='z-form__one-of-two'>
              <Field
                tabIndex={2}
                type='password'
                name='password'
                component={ReduxFormTextInput}
                placeholder={intl.formatMessage(m.app.User.newPassword)}
                smallLabel={intl.formatMessage(m.app.User.newPassword)}
              />
            </div>
          </div>
          <div className='z-form__grid'>
            <div className='z-form__one-of-two'>
              <Field
                tabIndex={2}
                type='password'
                name='passwordAgain'
                component={ReduxFormTextInput}
                placeholder={intl.formatMessage(m.app.User.newPasswordAgain)}
                smallLabel={intl.formatMessage(m.app.User.newPasswordAgain)}
              />
            </div>
          </div>

          <div className='z-form__grid'>
            <Button
              tabIndex={3}
              btnStyle='success'
              inProgress={submitting}
              type='submit'
            >
              <FormattedMessage {...m.app.User.savePassword} />
            </Button>
          </div>

        </FormSection>
      </form>
    )
  }
}

const validator = createValidator({
  oldPassword: [
    i18nize(required, m.app.AuthValidation.passwordRequired),
  ],
  password: [
    i18nize(required, m.app.UserValidation.newPasswordRequired),
    i18nize(minLength, m.app.AuthValidation.passwordMinLength, [8]),
    i18nize(maxLength, m.app.AuthValidation.passwordMaxLength, [64]),
    i18nize(accountPassword, m.app.AuthValidation.passwordInvalid)
  ],
  passwordAgain: [
    i18nize(required, m.app.AuthValidation.passwordAgainRequired),
    i18nize(equalTo, m.app.AuthValidation.passwordsDoNotMatch, ['password'])
  ]
})

const PasswordChangeForm = reduxForm({
  form: 'passwordChange',
  validate: validator
})(PasswordChange)

const mapStateToProps = state => ({
  initialValues: {
    username: state.user.data.username
  }
})

const mapDispatchToProps = {
  updateAccountRequest: UserActions.updateAccountRequest
}

const IntlInjected = injectIntl(PasswordChangeForm)
const CPasswordChange = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export default CPasswordChange
