import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet'

import m from 'commons/I18n/'

class Benefits extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.seoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.seoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.seoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.seoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.seoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.seoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          <div className='benefits__title'>{fm(m.app.Benefits.title)}</div>
          <p>
            {fm(m.app.Benefits.p1Body1)}{' '}
            <Link to='/benefits/secure-transactions'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p1Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p2Body1)}{' '}
            <Link to='/benefits/protecting-your-email-address'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p2Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p3Body1)}{' '}
            <Link to='/benefits/no-leaking-metadata'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p3Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p4Body1)}{' '}
            <Link to='/benefits/your-real-email-address'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p4Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p5Body1)}{' '}
            <Link to='/benefits/no-changes-to-your-system'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p5Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p6Body1)}{' '}
            <Link to='/benefits/protecting-from-intercept'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p6Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p7Body1)}{' '}
            <Link to='/benefits/end-to-end-encryption'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p7Body2)}
          </p>
          <p>
            {fm(m.app.Benefits.p8Body1)}{' '}
            <Link to='/benefits/email-path-analytics'>{fm(m.app.Benefits.learnMore)}</Link>{' '}
            {fm(m.app.Benefits.p8Body2)}
          </p>
        </div>
      </section>
    )
  }
}

const InjectedBenefits = injectIntl(Benefits)

export default InjectedBenefits
