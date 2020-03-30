import React from 'react'
import PropTypes from 'prop-types'
import Slider from 'react-slick'

import pathanalyzer from 'app/assets/homepage/screenshots/pathanalyzer.jpg'
import mailbox from 'app/assets/homepage/screenshots/mailbox.jpg'
import compose from 'app/assets/homepage/screenshots/compose.jpg'
import chat from 'app/assets/homepage/screenshots/chat.jpg'
import management from 'app/assets/homepage/screenshots/management.jpg'

const SCREENSHOTS = [management, mailbox, compose, pathanalyzer, chat]

const getMarketingScreenshotsList = () => SCREENSHOTS.map((s, i) => (
  <li className='homepage__screenshot' key={i}>
    <img src={s} className='homepage__screenshot__image' alt='MsgSafe.io screenshots' />
  </li>
))

const MarketingScreenshots = p => {
  const list = p.isGTSmScreen
    ? <ul className='homepage__screenshots'>{getMarketingScreenshotsList()}</ul>
    : (
      <Slider
        className='homepage__screenshots'
        arrows={false}
        dots
        autoplay
        autoplaySpeed={3000}
        responsive={[
          { breakpoint: 500, settings: { slidesToShow: 1 } },
          { breakpoint: 650, settings: { slidesToShow: 2 } },
          { breakpoint: 768, settings: { slidesToShow: 3 } }
        ]}
      >
        {getMarketingScreenshotsList()}
      </Slider>
    )

  return <div className='homepage__screenshots-container'>{list}</div>
}

MarketingScreenshots.propTypes = {
  isGTSmScreen: PropTypes.bool
}

export default MarketingScreenshots
