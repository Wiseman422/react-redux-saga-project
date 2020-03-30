import React from 'react'
import { injectIntl, intlShape } from 'react-intl'

import m from 'commons/I18n/'

import HeadImage from 'app/assets/mobileapp/iphone_android#1.png'
import AppStoreImage from 'app/assets/mobileapp/img-btn-appstore.png'
import googleStore from 'app/assets/mobileapp/img-btn-googlestore.png'

const PageHeader = p => {
  const fm = p.intl.formatMessage

  return (
    <div className='mktpage__hero mktpage__block mktpage__block--inverse'>
      <div className='container'>
        <div className='mktpage__hero__post'>
          <div>
            <h5 className='mktpage__block__pre'>{fm(m.app.MobileApp.headerPre)}</h5>
            <h1 className='mktpage__block__title'>{fm(m.app.Marketing.title)}</h1>
          </div>
          <div>
            <div className='apple-store-btn-container ribbon-container'>
              <div className='corner-ribbon top-left shadow'>Coming Soon!</div>
              {/*<a href='//store.apple.com' target='blank' className='download-btn'>*/}
              <img src={AppStoreImage} alt='AppStore' />
              {/*</a>*/}
            </div>
            <div className='google-store-btn-container'>
              <a href='https://www.msgsafe.io/android' className='download-btn'>
                <img src={googleStore} alt='GoogleStore' />
              </a>
            </div>
          </div>
        </div>
        <div className='mktpage__hero__media'>
          <img className='media' src={HeadImage} alt='iphone' />
        </div>
      </div>
    </div>
  )
}

PageHeader.propTypes = {
  intl: intlShape
}

export default injectIntl(PageHeader)
