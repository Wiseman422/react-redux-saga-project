import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Slider from 'react-slick'
import MarkImage from 'app/assets/homepage/images/mark.png'
import TestiImage2 from 'app/assets/homepage/images/testimonial2.png'

import m from 'commons/I18n/'

const Testimonials = [
  {
    title: m.app.Testimonial.firstTitle,
    position: m.app.Testimonial.firstPosition,
    description: m.app.Testimonial.firstDescription,
    pic: MarkImage
  },
  {
    title: m.app.Testimonial.firstTitle,
    position: m.app.Testimonial.firstPosition,
    description: m.app.Testimonial.firstDescription,
    pic: TestiImage2
  },
  {
    title: m.app.Testimonial.firstTitle,
    position: m.app.Testimonial.firstPosition,
    description: m.app.Testimonial.firstDescription,
    pic: MarkImage
  }
]

const getTestimonialList = () => Testimonials.map((f, i) => (
  <li className='testimonial-slide' key={i}>
    <div className='testimonial-slide-body'>
      <div className='testimonial-slide__icon'>
        <img src={f.pic} alt={f.title} />
      </div>
      <div className='testimonial-slide__content'>
        <div className='testimonial-slide__description'>
          <FormattedMessage {...f.description} />
        </div>

        <div className='testimonial-slide__title'>
          <FormattedMessage {...f.title} />
        </div>
        <div className='testimonial-slide__position'>
          <FormattedMessage {...f.position} />
        </div>
      </div>
    </div>
  </li>
))

const TestimonialSlider = (props) => {
  const slider = props.isMdScreen ? <Slider
    className='testimonial-slider'
    centerMode
    centerPadding='325px'
    slidesToShow={1}
    dots
    arrows={false}
    slidesToScroll={1}
  >
    { getTestimonialList() }
  </Slider> : <Slider
    className='testimonial-slider'
    centerMode
    centerPadding='0'
    slidesToShow={1}
    dots
    arrows={false}
    slidesToScroll={1}
  >
    { getTestimonialList() }
  </Slider>

  return <div>{slider}</div>
}

TestimonialSlider.propTypes = {
  isMdScreen: PropTypes.bool
}

export default TestimonialSlider
