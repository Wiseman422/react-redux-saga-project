import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import encrypted from 'app/assets/benefits/encrypted.png'

class YourRealEmailAddress extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s3SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s3SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s3SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s3SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s3SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s3SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          {/*<img src={encrypted} className='benefits__image' alt='Protecting your real email address' />*/}
          <div className='benefits__title'>{fm(m.app.Benefits.s3Title)}</div>
          <p>{fm(m.app.Benefits.s3p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s3p2Body)}</p>
          <p>{fm(m.app.Benefits.s3p3Body)}</p>
          <p>{fm(m.app.Benefits.s3p4Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedYourRealEmailAddress = injectIntl(YourRealEmailAddress)

export default InjectedYourRealEmailAddress
