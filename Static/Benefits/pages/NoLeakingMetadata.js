import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import noleakingmeta from 'app/assets/benefits/noleakingmeta.png'

class NoLeakingMetadata extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s2SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s2SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s2SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s2SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s2SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s2SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={noleakingmeta} className='benefits__image' alt='No leaking meta data' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s2Title)}</div>
          <p>{fm(m.app.Benefits.s2p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s2p2Body)}</p>
          <p>{fm(m.app.Benefits.s2p3Body)}</p>
          <p>{fm(m.app.Benefits.s2p4Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedNoLeakingMetadata = injectIntl(NoLeakingMetadata)

export default InjectedNoLeakingMetadata
