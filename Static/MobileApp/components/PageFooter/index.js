import React from 'react'
import { injectIntl, intlShape } from 'react-intl'

import m from 'commons/I18n/'

import AppStoreImage from 'app/assets/mobileapp/img-btn-appstore1.png'
import IphoneImage from 'app/assets/mobileapp/iphone_android#2.png'
import googleStore from 'app/assets/mobileapp/img-btn-googlestore1.png'

const PageFooter = p => {
  const fm = p.intl.formatMessage

  return (
    <div className='mktpage__footer mktpage__block'>
      <div className='container'>
        <div className='mktpage__footer__post'>
          <div>
            <h1 className='slogan'>{fm(m.app.MobileApp.slogan)}</h1>
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
        <div className='mktpage__footer__media'>
          <img src={IphoneImage} alt='iphone' />
        </div>
      </div>
    </div>
  )
}

PageFooter.propTypes = {
  intl: intlShape
}

export default injectIntl(PageFooter)
