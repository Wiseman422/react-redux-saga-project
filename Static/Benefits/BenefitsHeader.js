import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Button from 'app/Components/Button'

import m from 'commons/I18n/'

import iPhone7Jetblack from 'app/assets/benefits/iPhone7_Jetblack_7_North&Nano.png'

const BenefitsHeader = p => (
  <div className='benefits__header'>
    <div className='benefits__header-title-container'>
      <p className='benefits__header__title'>
        <FormattedMessage {...m.app.Benefits.benefitsPlural} className='benefits__header__title' />
      </p>

      <p className='benefits__header__sub_title'>
        <FormattedMessage {...m.app.Benefits.title} />
      </p>

      <p className='benefits__header__description'>
        <FormattedMessage {...m.app.Benefits.p1Body1} />
      </p>
    </div>

    <div className='benefits__header__image'>
      <div className='benefits__header__image-container'>
        <img src={iPhone7Jetblack} className='benefits__header__mac-image' />
      </div>
    </div>
  </div>
)

export default BenefitsHeader
