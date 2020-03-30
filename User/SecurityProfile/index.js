import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'

import { FullPageView } from 'app/Components/FullPageView'
import HelmetTitle from 'app/Components/HelmetTitle'

import UsernameChange from './UsernameChange'
import PasswordChange from './PasswordChange'

export class SecurityProfile extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.SECURITY_PROFILE)
  }

  render () {
    const { intl } = this.props

    return (
      <FullPageView
        title={intl.formatMessage(m.app.User.accountSecurityTitle)}
        className='security-profile-container'
      >
        <HelmetTitle titleTrans={m.app.User.accountSecurityTitle} />
        <UsernameChange />
        <PasswordChange />
      </FullPageView>
    )
  }
}

const IntlInjected = injectIntl(SecurityProfile)

export const SecurityProfileRoute = {
  components: { children: IntlInjected, hideNav: 'true' },
  path: '/profile/security'
}
