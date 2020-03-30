import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import e2ee from 'app/assets/benefits/e2ee.png'

class EndToEndEncryption extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s6SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s6SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s6SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s6SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s6SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s6SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={e2ee} className='benefits__image' alt='End-to-end encryption' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s6Title)}</div>
          <p>{fm(m.app.Benefits.s6p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s6p2Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedEndToEndEncryption = injectIntl(EndToEndEncryption)

export default InjectedEndToEndEncryption
