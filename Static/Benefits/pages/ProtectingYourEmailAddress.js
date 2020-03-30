import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import encrypted from 'app/assets/benefits/encrypted.png'

class ProtectingYourEmailAddress extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s1SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s1SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s1SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s1SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s1SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s1SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={encrypted} className='benefits__image' alt='Protecting your email address' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s1Title)}</div>
          <p>{fm(m.app.Benefits.s1p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s1p2Body)}</p>
          <ul>
            <li>{fm(m.app.Benefits.s1p2Bullet1)}</li>
            <li>{fm(m.app.Benefits.s1p2Bullet2)}</li>
            <li>{fm(m.app.Benefits.s1p2Bullet3)}</li>
          </ul>
          <p>{fm(m.app.Benefits.s1p3Body)}</p>
          <p>{fm(m.app.Benefits.s1p4Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedProtectingYourEmailAddress = injectIntl(ProtectingYourEmailAddress)

export default InjectedProtectingYourEmailAddress
