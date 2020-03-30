import React from 'react'
import { injectIntl, intlShape } from 'react-intl'

import m from 'commons/I18n/'
import phoneImage from 'app/assets/mobileapp/iPhone7_Jetblack_2_North&Nano.png'
const ProductBenefits = p => {
  const fm = p.intl.formatMessage

  return (
    <div className='mktpage__benefits mktpage__block mktpage__block--inverse'>
      <div className='mktpage__benefits__media'>
        <img className='' src={phoneImage} />
      </div>
      <div className='mktpage__benefits__post'>
        <h5 className='pre mktpage__block__pre'>{fm(m.app.MobileApp.benefitsPre)}</h5>
        <h1 className='title mktpage__block__title'>{fm(m.app.MobileApp.benefitsTitle)}</h1>
        <div className='content' dangerouslySetInnerHTML={{ __html: fm(m.app.MobileApp.benefitsContent) }} />
        <a className='readmore-btn' href='#'>{fm(m.app.MobileApp.benefitsReadmore)}</a>
        <svg className='icon-logo hidden-xs hidden-sm' width='484px' height='484px'>
          <use xlinkHref='#msgsafe-logo' />
        </svg>
      </div>
    </div>
  )
}

ProductBenefits.propTypes = {
  intl: intlShape
}

export default injectIntl(ProductBenefits)
