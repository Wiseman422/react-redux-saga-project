import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { Helmet } from 'react-helmet'
import ContentEmphasisBlock from './ContentEmphasisBlock'

import m from 'commons/I18n/'

class SecureTransactions extends Component {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage

    return (
      <section className='benefits__section'>

        <Helmet>
          <title>{fm(m.app.Benefits.tlsSeoTitle)}</title>
          <meta name='description' content={fm(m.app.Benefits.tlsSeoDescription)} />
          <meta name='og:title' content={fm(m.app.Benefits.tlsSeoTitle)} />
          <meta name='og:description' content={fm(m.app.Benefits.tlsSeoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Benefits.tlsSeoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Benefits.tlsSeoDescription)} />
        </Helmet>

        <div className='benefits__section__content'>
          <div className='benefits__title'>{fm(m.app.Benefits.tslTitle)}</div>
          <p>{fm(m.app.Benefits.tslp1Body)}</p>
          <ContentEmphasisBlock content={fm(m.app.Benefits.s7b1Body)} />
          <p>{fm(m.app.Benefits.tslp2Body)}</p>
          <p>{fm(m.app.Benefits.tslp3Body)}</p>
          <p>{fm(m.app.Benefits.tslp4Body)}</p>
          <div className='benefits__tls-keys'>
            <strong>www.msgsafe.io</strong><br />
            Fingerprint SHA1: <span className='benefits__tls-key'>307b178d3f4775c233e70c6ae096b00ac672aa60</span><br />
            Pin SHA256: <span className='benefits__tls-key'>60J+uBsULLchqgoeQGCJeLilfJP/JWzhwUb06mXkvGM=</span><br /><br />
            <strong>api.msgsafe.io</strong><br />
            Fingerprint SHA1: <span className='benefits__tls-key'>a6527ad4575380934dc664363a70ba0771576084</span><br />
            Pin SHA256: <span className='benefits__tls-key'>KT0YIXR+15TBe0BmIKKwCNo3zd3+LAs9CI57Ni2kLQE=</span>
          </div>
        </div>
      </section>
    )
  }
}

const InjectedSecureTransactions = injectIntl(SecureTransactions)

export default InjectedSecureTransactions
