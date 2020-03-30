import React, { Component } from 'react'
import PropTypes from 'prop-types'
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

class GetOneFeature extends Component {
  static propTypes = {
    feature: PropTypes.object,
    type: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      featureToggle: false
    }
  }

  render () {
    const { feature, type } = this.props
    const { featureToggle } = this.state

    return (
      <div>
        <div className={`homepage__feature__icon ${type === 'small' && 'homepage__feature__center'}`}>
          <div className='homepage__feature__icon__background'>
            <feature.icon />
          </div>
        </div>
        <div className={`homepage__feature__title ${type === 'small' && 'homepage__feature__center'}`}>
          <FormattedMessage {...feature.title} />
        </div>
        <div className={`homepage__feature__description ${featureToggle || type === 'small' ? '' : 'homepage__feature__ellipsis'}`}>
          <FormattedMessage {...feature.description} />
        </div>
        { type === 'big' &&
          <div className='homepage__feature__more' onClick={() => {
            this.setState({featureToggle: !featureToggle})
          }}>
            + More
          </div>
        }
      </div>
    )
  }
}

const getFeaturesList = (type = 'big') => FEATURES.map((f, i) => (
  <li className='homepage__feature' key={i}>
    <GetOneFeature feature={f} type={type} />
  </li>
))

const MarketingFeatures = p => p.isGTSmScreen
  ? <ul className='homepage__features'>{getFeaturesList()}</ul>
  : (
    <Slider
      className='homepage__features'
      dots
      arrows={false}
      autoplay
      autoplaySpeed={5000}
      responsive={[
        { breakpoint: 500, settings: { slidesToShow: 1 } },
        { breakpoint: 768, settings: { slidesToShow: 2 } }
      ]}
    >
      {getFeaturesList('small')}
    </Slider>
  )

MarketingFeatures.propTypes = {
  isGTSmScreen: PropTypes.bool
}

export default MarketingFeatures
