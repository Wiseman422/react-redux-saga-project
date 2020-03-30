import React from 'react'
import compImage from 'app/assets/homepage/images/responsive_isometric_comp_02.png'
import { FormattedMessage } from 'react-intl'
import MarketingAppLink from '../MarketingAppLink/'

import MultiPlatform from 'app/Components/Art/MultiPlatform'

import m from 'commons/I18n/'

const Highlights = [
  {
    title: m.app.Home.multiPlatformHighLight1,
    description: m.app.Home.multiPlatformHighLight1Description
  },
  {
    title: m.app.Home.multiPlatformHighLight2,
    description: m.app.Home.multiPlatformHighLight2Description
  },
  {
    title: m.app.Home.multiPlatformHighLight3,
    description: m.app.Home.multiPlatformHighLight3Description
  }
]

const getHighlightsList = () => Highlights.map((f, i) => (
  <div className='multi__platform__content__list' key={i}>
    <div className='multi__platform__content__list__title'>
      <FormattedMessage {...f.title} />
    </div>
    <div className='multi__platform__content__list__description'>
      <FormattedMessage {...f.description} />
    </div>
  </div>
))

const MarketingMultiPlatform = () => {
  return (
    <div className='homepage__multi__platform'>
      <div className='grey-left-gradient-bg-top' />
      <div className='homepage__multi__platform__body'>
        <div className='homepage__multi__platform__icon'>
          <MultiPlatform />
        </div>
        <div className='multi__platform__comp__image__container'>
          <img src={compImage} className='multi__platform__comp__image' />
        </div>

        <div className='multi__platform__content'>

          <div className='multi__platform__content__main'>
            <div className='multi__platform__content__main__title'>
              <FormattedMessage {...m.app.Home.multiPlatform} />
            </div>
            <div className='multi__platform__content__main__description multi__platform__ellipsis'>
              <FormattedMessage {...m.app.Home.multiPlatformDescription} />
            </div>
          </div>

          { getHighlightsList() }

        </div>
      </div>
      <MarketingAppLink />
    </div>
  )
}

export default MarketingMultiPlatform
