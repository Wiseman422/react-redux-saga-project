import React from 'react'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'

import TestimonialIcon from 'app/Components/Art/TestimonialIcon'
import TestimonialSlider from './TestimonialSlider'

import m from 'commons/I18n/'

const MarketingTestimonial = (props) => {
  return (
    <div className='homepage__testimonial' >
      <div className='homepage__testimonial__header'>
        <div className='homepage__testimonial__icon'>
          <TestimonialIcon />
        </div>
        <div className='homepage__testimonial__title'>
          <FormattedMessage {...m.app.Home.testimonials} />
        </div>
      </div>
      <div className='homepage__testimonials__container'>
        <TestimonialSlider isMdScreen={props.isMdScreen} />
      </div>
    </div>
  )
}

MarketingTestimonial.propTypes = {
  isMdScreen: PropTypes.bool
}
export default MarketingTestimonial
