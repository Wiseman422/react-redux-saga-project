import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import moment from 'moment'
import momentTimezones from 'moment-timezone'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import LOCALES from 'commons/I18n/locales'
import UserActions from 'commons/Redux/UserRedux'
import { isPendingOnboard } from 'commons/Selectors/User'
import { extractRegionDataFromUser } from 'commons/Selectors/Region'
import { createValidator, i18nize, required, minLength } from 'commons/Lib/Validators'

import history from 'app/Routes/History'
import CountryLabel from 'app/Components/CountryLabel'
import FormSection from 'app/Components/Form/FormSection'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import ReduxFormSelect from 'app/Components/Form/ReduxFormSelect'
import ReduxFormRadio from 'app/Components/Form/ReduxFormRadio'
import Button from 'app/Components/Button'
import { FullPageView, FullPageViewToolbar } from 'app/Components/FullPageView'
import HelmetTitle from 'app/Components/HelmetTitle'

const localeData = LOCALES.map(l => ({ value: l[0], label: l[1] }))

const emailContentValueToForm = value => {
  if (value === true) return 'auto'
  if (value === false) return 'manual'
  return 'none'
}

const emailContentFormToValue = str => {
  if (str === 'auto') return true
  if (str === 'manual') return false
  return null
}

const getTimeZoneData = () => {
  const guessedTz = moment.tz.guess()
  // First two items with browser time and guessed timezone
  let timeZoneData = [
    { value: '', label: `Browser Time (${moment().format('h:mm a')})` },
    { value: guessedTz, label: `${guessedTz} (${moment.tz(guessedTz).format('h:mm a')})` }
  ]
  // Concatnate with the full timezone list from moment
  timeZoneData = timeZoneData.concat(momentTimezones.tz.names().map(
    tz => ({ value: tz, label: `${tz} (${moment.tz(tz).format('h:mm a')})` })
  ))
  return timeZoneData
}

export class UserProfile extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

    submitting: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    handleSubmit: PropTypes.func,

    username: PropTypes.string,
    region: PropTypes.object.isRequired,
    updateAccountRequest: PropTypes.func,
    isPendingOnboard: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
    this._getRemoteContentOptions = this._getRemoteContentOptions.bind(this)
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.USER_PROFILE)
  }

  _handleSubmit (values) {
    let p = {
      display_name: values.fullName,
      region: values.defaultCountryOfOrigin,
      locale: values.preferredLanguage,
      timezone: (values.timeZone && typeof values.timeZone === 'object') ? values.timeZone.value : values.timeZone,
      pref_mail_load_remote_content: emailContentFormToValue(values.loadRemoteContent),
      pref_mail_load_embedded_image: emailContentFormToValue(values.loadEmbeddedImages)
    }
    const action = this.props.updateAccountRequest
    return new Promise((resolve, reject) => action(
      p,
      (...args) => {
        history.goBack()
        resolve(...args)
      },
      reject
    ))
  }

  _getRemoteContentOptions () {
    const fm = this.props.intl.formatMessage
    return [
      { label: fm(m.app.Contact.auto), value: emailContentValueToForm(true) },
      { label: fm(m.app.Contact.manual), value: emailContentValueToForm(false) },
      // { label: fm(m.app.Contact.inherit), value: emailContentValueToForm(null) }
    ]
  }

  render () {
    const { username, submitting, handleSubmit, intl, region, isPendingOnboard } = this.props

    return (
      <FullPageView
        title={intl.formatMessage(m.app.Preferences.title, {userName: username})}
        hideCloseButton={isPendingOnboard}
      >
        <HelmetTitle titleTrans={m.app.Preferences.titleMeta} />
        <form className='edit-view z-form z-form--alpha' onSubmit={handleSubmit(this._handleSubmit)}>
          <div className='edit-view__body'>
            <Field
              tabIndex={1}
              type='text'
              name='fullName'
              component={ReduxFormTextInput}
              placeholder={intl.formatMessage(m.app.Preferences.displayName)}
              label={intl.formatMessage(m.app.Preferences.displayName)}
            />
            <Field
              tabIndex={2}
              type='text'
              name='preferredLanguage'
              component={ReduxFormSelect}
              options={localeData}
              label={intl.formatMessage(m.app.Preferences.preferredLanguage)}
              helpText={intl.formatMessage(m.app.Preferences.preferredLanguageHelp)}
            />
            <Field
              tabIndex={3}
              name='timeZone'
              component={ReduxFormSelect}
              options={getTimeZoneData()}
              label={intl.formatMessage(m.app.Preferences.preferredTimeZone)}
              helpText={intl.formatMessage(m.app.Preferences.preferredTimeZoneHelp)}
            />
            <Field
              tabIndex={4}
              name='defaultCountryOfOrigin'
              component={ReduxFormSelect}
              label={intl.formatMessage(m.app.Preferences.preferredOrigin)}
              helpText={intl.formatMessage(m.app.Preferences.preferredOriginHelp)}
              options={region.data}
            />

            <FormSection
              title={intl.formatMessage(m.app.Contact.remoteImageContentTitle)}
              withTopBorder
            >
              <div className='z-form__grid'>
                <div className='z-form__one-of-two'>
                  <Field
                    tabIndex={7}
                    name='loadRemoteContent'
                    component={ReduxFormRadio}
                    smallLabel={intl.formatMessage(m.app.Contact.loadRemoteContent)}
                    options={this._getRemoteContentOptions()}
                  />
                </div>
                <div className='z-form__one-of-two'>
                  <Field
                    tabIndex={8}
                    name='loadEmbeddedImages'
                    component={ReduxFormRadio}
                    smallLabel={intl.formatMessage(m.app.Contact.loadEmbeddedImages)}
                    options={this._getRemoteContentOptions()}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          <FullPageViewToolbar contentRight>
            <Button
              tabIndex={5}
              btnStyle='success'
              type='submit'
              inProgress={submitting}
            >
              <FormattedMessage {...m.app.Common.saveChanges} />
            </Button>
          </FullPageViewToolbar>
        </form>
      </FullPageView>
    )
  }
}

const validator = createValidator({
  fullName: [
    i18nize(required, m.app.CommonValidation.fullNameRequired),
    i18nize(minLength, m.app.CommonValidation.minLength4, [4])
  ],
  preferredLanguage: [
    i18nize(required, m.app.UserValidation.preferredLanguageRequired)
  ],
  defaultCountryOfOrigin: [
    i18nize(required, m.app.UserValidation.defaultCountryOfOriginRequired)
  ]
})

const UserProfileForm = reduxForm({
  form: 'editProfile',
  validate: validator
})(UserProfile)

const mapStateToProps = state => ({
  username: state.user.data.username,
  region: extractRegionDataFromUser(state.user, CountryLabel),
  isPendingOnboard: isPendingOnboard(state),
  initialValues: {
    defaultCountryOfOrigin: state.user.data.region || 'us',
    fullName: state.user.data.display_name,
    preferredLanguage: state.user.data.locale || 'en-US',
    timeZone: state.user.data.timezone,
    loadRemoteContent: emailContentValueToForm(state.user.data.pref_mail_load_remote_content),
    loadEmbeddedImages: emailContentValueToForm(state.user.data.pref_mail_load_embedded_image)
  }
})

const mapDispatchToProps = {
  updateAccountRequest: UserActions.updateAccountRequest
}

const IntlInjected = injectIntl(UserProfileForm)
const CUserProfile = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)

export const UserProfileRoute = {
  components: { children: CUserProfile, hideNav: 'true' },
  path: '/profile'
}
