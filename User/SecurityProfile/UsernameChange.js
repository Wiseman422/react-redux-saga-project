import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import UserActions from 'commons/Redux/UserRedux'
import { createValidator, i18nize, required, minLength, maxLength, accountUsername } from 'commons/Lib/Validators'

import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import FormSection from 'app/Components/Form/FormSection'
import Button from 'app/Components/Button'

class UsernameChange extends Component {
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
    return new Promise((resolve, reject) => this.props.updateAccountRequest(values, resolve, reject))
  }

  render () {
    const { intl, handleSubmit, submitting, error } = this.props

    return (
      <form onSubmit={handleSubmit(this._handleSubmit)} className='edit-view z-form z-form--alpha'>
        <FormSection
          title={intl.formatMessage(m.app.Auth.username)}
          className='edit-view__body'
          initiallyVisible
        >
          { error && <div className='z-form__error z-form__error--large'>{error}</div> }
          <div className='z-form__grid'>
            <div className='z-form__one-of-two'>
              <Field
                tabIndex={1}
                type='text'
                name='username'
                component={ReduxFormTextInput}
                placeholder={intl.formatMessage(m.app.Auth.username)}
              />
            </div>
            <div className='z-form__one-of-two'>
              <Button
                tabIndex={2}
                btnStyle='success'
                inProgress={submitting}
                type='submit'
              >
                <FormattedMessage {...m.app.Common.save} />
              </Button>
            </div>
          </div>

          <div className='z-help'><FormattedMessage {...m.app.User.usernameChangeHelp1} /></div>
          <div className='z-help'>
            <b><FormattedMessage {...m.app.User.usernameChangeHelp2_1} /> </b>
            <FormattedMessage {...m.app.User.usernameChangeHelp2_2} />
          </div>
        </FormSection>
      </form>
    )
  }
}

const validator = createValidator({
  username: [
    i18nize(required, m.app.AuthValidation.usernameRequired),
    i18nize(minLength, m.app.AuthValidation.usernameMinLength, [5]),
    i18nize(maxLength, m.app.AuthValidation.usernameMaxLength, [30]),
    i18nize(accountUsername, m.app.AuthValidation.usernameRegex)
  ]
})

const UsernameChangeForm = reduxForm({
  form: 'usernameChange',
  validate: validator
})(UsernameChange)

const mapStateToProps = state => ({
  initialValues: {
    username: state.user.data.username
  }
})

const mapDispatchToProps = {
  updateAccountRequest: UserActions.updateAccountRequest
}

const IntlInjected = injectIntl(UsernameChangeForm)
const CUsernameChange = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export default CUsernameChange
