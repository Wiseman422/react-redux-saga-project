import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import Slider from 'react-slick'
import VirtualMailboxes from 'app/Components/Art/VirtualMailboxes'
import EndToEnd from 'app/Components/Art/EndToEnd'
import BringDomain from 'app/Components/Art/BringDomain'
import SecureVideo from 'app/Components/Art/SecureVideo'
import EmailAnalysis from 'app/Components/Art/EmailAnalysis'
import Success from 'app/Components/Art/Success'

import m from 'commons/I18n/'

const FEATURES = [
  {
    title: m.app.Home.virtualMailboxes,
    description: m.app.Home.virtualMailboxesText,
    icon: VirtualMailboxes
  },
  {
    title: m.app.Home.endToEndEncryption,
    description: m.app.Home.endToEndEncryptionText,
    icon: EndToEnd
  },
  {
    title: m.app.Home.bringOrBuyYourOwnDomain,
    description: m.app.Home.bringOrBuyYourOwnDomainText,
    icon: BringDomain
  },
  {
    title: m.app.Home.secureEncryptedVoiceVideo,
    description: m.app.Home.secureEncryptedVoiceVideoText,
    icon: SecureVideo
  },
  {
    title: m.app.Home.emailAnalysisFiltering,
    description: m.app.Home.emailAnalysisFilteringText,
    icon: EmailAnalysis
  },
  {
    title: m.app.Home.dedicatedToImprovingYourPrivacy,
    description: m.app.Home.dedicatedToImprovingYourPrivacyText,
    icon: Success
  }
]

const getFeaturesList = () => FEATURES.map((f, i) => (
  <li className='features-slide' key={i}>
    <div className='features-slide__icon'>
      <f.icon />
    </div>
    <div className='features-slide__title'>
      <FormattedMessage {...f.title} />
    </div>
    <div className='features-slide__description'>
      <FormattedMessage {...f.description} />
    </div>
  </li>
))

class MarketingFeatures extends PureComponent {
  render () {
    return (<Slider
      className='features-slider'
      dots
      arrows={false}
      autoplay
      autoplaySpeed={8000}
      slidesToShow={1}
      slidesToScroll={1}
    >
      {getFeaturesList()}
    </Slider>)
  }
}

export default MarketingFeatures
