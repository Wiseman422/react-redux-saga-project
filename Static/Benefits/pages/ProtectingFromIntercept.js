import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import no3rdparty from 'app/assets/benefits/no3rdparty.png'

class ProtectingFromIntercept extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s5SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s5SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s5SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s5SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s5SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s5SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={no3rdparty} className='benefits__image' alt='Protection from intercept' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s5Title)}</div>
          <p>{fm(m.app.Benefits.s5p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s5p2Body)}</p>
          <p>{fm(m.app.Benefits.s5p3Body)}</p>
          <p>{fm(m.app.Benefits.s5p4Body)}</p>
          <p>{fm(m.app.Benefits.s5p5Body)}</p>
          <p>{fm(m.app.Benefits.s5p6Body)}</p>
          <p>{fm(m.app.Benefits.s5p7Body)}</p>
          <p>{fm(m.app.Benefits.s5p8Body)}</p>
          <p>{fm(m.app.Benefits.s5p9Body)}</p>
          <p>{fm(m.app.Benefits.s5p10Body)}</p>
          <p>{fm(m.app.Benefits.s5p11Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedProtectingFromIntercept = injectIntl(ProtectingFromIntercept)

export default InjectedProtectingFromIntercept
