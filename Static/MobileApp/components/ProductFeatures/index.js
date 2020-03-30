import React from 'react'
import { injectIntl, intlShape } from 'react-intl'

import m from 'commons/I18n/'

import FAComments from 'react-icons/lib/fa/comments'
import FALock from 'react-icons/lib/fa/lock'
import FAEnvolope from 'react-icons/lib/fa/envelope'
import IphoneImage from 'app/assets/mobileapp/S8Mockup-msgsafe-half.png'
import SecureVideo from 'app/Components/Art/SecureVideoWhite'
import EndToEnd from 'app/Components/Art/EndToEndWhite'
import Success from 'app/Components/Art/Success'

const features = [
  {
    title: m.app.MobileApp.featuresTitle1,
    content: m.app.MobileApp.featuresContent1,
    glyph: SecureVideo
  }, {
    title: m.app.MobileApp.featuresTitle2,
    content: m.app.MobileApp.featuresContent2,
    glyph: EndToEnd
  }, {
    title: m.app.MobileApp.featuresTitle3,
    content: m.app.MobileApp.featuresContent3,
    glyph: Success
  }
]

const ProductFeatures = p => {
  const fm = p.intl.formatMessage

  return (
    <div className='mktpage__features mktpage__block'>
      <div className='container'>
        <div className='mktpage__features__media hidden-xs hidden-sm'>
          <img src={IphoneImage} alt='' />
          <svg className='icon-logo' width='181px' height='181px'>
            <use xlinkHref='#msgsafe-logo' />
          </svg>
        </div>
        <div className='mktpage__features__post'>
          <h5 className='mktpage__block__pre'>{fm(m.app.MobileApp.featuresPre)}</h5>
          <h1 className='mktpage__block__title'>{fm(m.app.MobileApp.featuresTitle)}</h1>
          <h2 className='mktpage__block__subtitle'>{fm(m.app.MobileApp.featuresSubtitle)}</h2>
          <ul className='mktpage__features__list'>
            {features.map((feature, idx) =>
              <li key={idx}>
                <feature.glyph />
                <h5>{fm(feature.title)}</h5>
                <p>{fm(feature.content)}</p>
              </li>
            )}
          </ul>
        </div>
      </div>
      <svg className='icon-logo' width='367px' height='367px'>
        <use xlinkHref='#msgsafe-logo' />
      </svg>
    </div>
  )
}

ProductFeatures.propTypes = {
  intl: intlShape
}

export default injectIntl(ProductFeatures)
