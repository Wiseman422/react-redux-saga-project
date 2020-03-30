import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'
import m from 'commons/I18n/'

// import nochanges from 'app/assets/benefits/nochanges.png'

class NoChangesToYourSystem extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.s4SeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.s4SeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.s4SeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.s4SeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.s4SeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.s4SeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          { /* <img src={nochanges} className='benefits__image' alt='No changes to system' /> */ }
          <div className='benefits__title'>{fm(m.app.Benefits.s4Title)}</div>
          <p>{fm(m.app.Benefits.s4p1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.s4p2Body)}</p>
          <p>{fm(m.app.Benefits.s4p3Body)}</p>
          <ul>
            <li>{fm(m.app.Benefits.s4p3Bullet1)}</li>
            <li>{fm(m.app.Benefits.s4p3Bullet2)}</li>
            <li>{fm(m.app.Benefits.s4p3Bullet3)}</li>
            <li>{fm(m.app.Benefits.s4p3Bullet4)}</li>
            <li>{fm(m.app.Benefits.s4p3Bullet5)}</li>
            <li>{fm(m.app.Benefits.s4p3Bullet6)}</li>
          </ul>
          <p>{fm(m.app.Benefits.s4p4Body)}</p>
        </div>
      </section>
    )
  }
}

const InjectedNoChangesToYourSystem = injectIntl(NoChangesToYourSystem)

export default InjectedNoChangesToYourSystem
