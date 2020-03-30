import React from 'react'

import iphone6Image from 'app/assets/homepage/images/iPhone6_Plus.png'
import iphone6Small from 'app/assets/homepage/images/iPhone6_small.png'
import appleStore from 'app/assets/homepage/images/app_store.png'
import googleStore from 'app/assets/homepage/images/google_store.png'
import { FormattedMessage } from 'react-intl'

import m from 'commons/I18n/'

const MarketingAppLink = () => {
  return (
    <div className='homepage__ios__app_container'>
      <div className='homepage__ios__app'>
        <div className='homepage__ios__app__left'>
          <img src={iphone6Image} className='multi__platform__ios__image display-desktop-only' />
          <img src={iphone6Small} className='multi__platform__ios__image display-mobile-only' />
        </div>
        <div className='homepage__ios__app__right'>
          <div className='homepage__ios__app__title'>
            <FormattedMessage {...m.app.Home.iOSAppTitle} />
          </div>
          <div className='homepage__ios__app__description'>
            <FormattedMessage {...m.app.Home.iOSAppDescription} />
          </div>
          <div className='homepage__ios__app__links__container'>
            {/*<a href='https://www.msgsafe.io/ios' className='homepage__ios__app__link ribbon-container'>*/}
            <a className='homepage__ios__app__link ribbon-container'>
              <div className='corner-ribbon top-left shadow'>Coming Soon!</div>
              <img src={appleStore} className='multi__platform__apple__icon' />
            </a>

            <a href='https://www.msgsafe.io/android' className='homepage__ios__app__link'>
              <img src={googleStore} className='multi__platform__apple__icon' />
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MarketingAppLink
