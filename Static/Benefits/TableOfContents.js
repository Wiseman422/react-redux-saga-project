import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Link } from 'react-router'

import m from 'commons/I18n/'

import EmailPathAnalytics from './pages/EmailPathAnalytics'
import EndToEndEncryption from './pages/EndToEndEncryption'
import NoChangesToYourSystem from './pages/NoChangesToYourSystem'
import NoLeakingMetadata from './pages/NoLeakingMetadata'
import ProtectingFromIntercept from './pages/ProtectingFromIntercept'
import ProtectingYourEmailAddress from './pages/ProtectingYourEmailAddress'
import SecureTransactions from './pages/SecureTransactions'
import YourRealEmailAddress from './pages/YourRealEmailAddress'

export const toc = [
  {
    title: m.app.Benefits.tslSmallTitle,
    path: '/benefits/secure-transactions',
    component: SecureTransactions
  },
  {
    title: m.app.Benefits.s1SmallTitle,
    path: '/benefits/protecting-your-email-address',
    component: ProtectingYourEmailAddress
  },
  {
    title: m.app.Benefits.s2SmallTitle,
    path: '/benefits/no-leaking-metadata',
    component: NoLeakingMetadata
  },
  {
    title: m.app.Benefits.s3SmallTitle,
    path: '/benefits/your-real-email-address',
    component: YourRealEmailAddress
  },
  {
    title: m.app.Benefits.s4SmallTitle,
    path: '/benefits/no-changes-to-your-system',
    component: NoChangesToYourSystem
  },
  {
    title: m.app.Benefits.s5SmallTitle,
    path: '/benefits/protecting-from-intercept',
    component: ProtectingFromIntercept
  },
  {
    title: m.app.Benefits.s6SmallTitle,
    path: '/benefits/end-to-end-encryption',
    component: EndToEndEncryption
  },
  {
    title: m.app.Benefits.s7SmallTitle,
    path: '/benefits/email-path-analytics',
    component: EmailPathAnalytics
  }
]

class TableOfContents extends Component {

  static propTypes = {
    intl: intlShape
  }

  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  _renderItem (page, i) {
    const fm = this.props.intl.formatMessage
    return (
      <li className='benefits__toc__li' key={i}>
        <Link
          className='benefits__toc__li__a'
          activeClassName='benefits__toc__li__a benefits__toc__li__a__active'
          to={`${page.path}#benefits_top`}
        >
          {fm(page.title)}
        </Link>
      </li>
    )
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <div className='benefits__toc'>
        <div className='benefits__toc__title'>
          {fm(m.app.Benefits.tocTitle)}
        </div>
        <ul className='benefits__toc__ul'>
          {toc.map(this._renderItem)}
        </ul>
      </div>
    )
  }
}

const InjectedTableOfContents = injectIntl(TableOfContents)

export default InjectedTableOfContents
