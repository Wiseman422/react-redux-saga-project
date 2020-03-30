import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { isNil, isEmpty } from 'ramda'
import country from 'country-list'

import m from 'commons/I18n/'
import { getReduxFormValue } from 'commons/Selectors/ReduxForm'

// Renders a .edit-view__info with information about identity's full
// email address and country of origin
export const IdentityBasicInfo = props => {
  let fullEmailView, originView

  if (props.email || (props.emailUsername && props.emailDomain)) {
    const email = props.email || `${props.emailUsername}@${props.emailDomain}`

    fullEmailView = (
      <span>
        <FormattedMessage {...m.app.Identity.emailAddressWillBe} /> <span className='edit-view__info__highlight'>{props.displayName} {'<'}{email}{'>'}</span>.
      </span>
    )
  }

  if (!isEmpty(props.countryOfOrigin) && !isNil(props.countryOfOrigin)) {
    const countryName = country().getName(props.countryOfOrigin)

    if (countryName) {
      originView = (
        <span>
          <FormattedMessage {...m.app.Identity.outgoingEmailWillBeFrom} /> <span className='edit-view__info__highlight'>{countryName}</span>.
        </span>
      )
    }
  }

  if (fullEmailView || originView) {
    return (
      <div className='edit-view__info'>
        {fullEmailView}{' '}{originView}
      </div>
    )
  }

  return null
}

IdentityBasicInfo.propTypes = {
  displayName: PropTypes.string,
  countryOfOrigin: PropTypes.string,
  emailUsername: PropTypes.string,
  emailDomain: PropTypes.string,
  email: PropTypes.string
}

const createMapStateToProps = FORM_IDENTIFIER => state => ({
  displayName: getReduxFormValue(state, FORM_IDENTIFIER, 'displayName'),
  countryOfOrigin: getReduxFormValue(state, FORM_IDENTIFIER, 'countryOfOrigin'),
  emailUsername: getReduxFormValue(state, FORM_IDENTIFIER, 'emailUsername'),
  emailDomain: getReduxFormValue(state, FORM_IDENTIFIER, 'emailDomain'),
  email: getReduxFormValue(state, FORM_IDENTIFIER, 'email')
})

const mapStateToPropsCreateForm = createMapStateToProps('createIdentity')
export const IdentityCreateFormBasicInfo = connect(mapStateToPropsCreateForm)(IdentityBasicInfo)

const mapStateToPropsEditForm = createMapStateToProps('editIdentity')
export const IdentityEditFormBasicInfo = connect(mapStateToPropsEditForm)(IdentityBasicInfo)
