import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'

import m from 'commons/I18n/'
import ContentEmphasisBlock from './ContentEmphasisBlock'
// import pathanalytics from 'app/assets/benefits/pathanalytics.png'

class SecureTransactions extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s7SeoTitle)}</title>
          <meta name='og:title' content={fm(m.app.Benefits.s7SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s7SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s7SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s7SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={pathanalytics} className='benefits__image' alt='Advanced email path analytics' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s7Title)}</div>
          <p>{fm(m.app.Benefits.s7p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s7p2Body)}</p>
          <p>{fm(m.app.Benefits.s7p3Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedSecureTransactions = injectIntl(SecureTransactions)

export default InjectedSecureTransactions
