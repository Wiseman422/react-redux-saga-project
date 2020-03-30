import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Button from 'app/Components/Button'
import Link from 'react-router/lib/Link'

import m from 'commons/I18n/'
/*
import backdrop from 'app/assets/backdrop.jpg'
import logoWhiteLarge from 'app/assets/logo_white_large.png'
*/
import macBookLarge from 'app/assets/homepage/images/macbook_iphone_s8.png'

import QUOTES from './quotes'

class MarketingHeaderQuotes extends Component {
  static propTypes = {
    quotes: PropTypes.array.isRequired,
    switchIntervalMs: PropTypes.number.isRequired
  }

  static defaultProps = {
    switchIntervalMs: 14000
  }

  constructor (props) {
    super(props)

    this.state = {
      quoteIndex: 0
    }
  }

  componentWillMount () {
    this._switchQuote()
  }

  componentDidMount () {
    this._interval = setInterval(this._switchQuote.bind(this), this.props.switchIntervalMs)
  }

  componentWillUnmount () {
    if (this._interval) {
      clearInterval(this._interval)
    }
  }

  _switchQuote () {
    this.setState({
      quoteIndex: Math.floor(Math.random() * this.props.quotes.length)
    })
  }

  render () {
    const q = this.props.quotes[this.state.quoteIndex]

    return (
      <div className='homepage__hero__quote'>
        <img src={q.image} className='homepage__hero__quote__avatar' alt='Protecting your communications' />
        <div className='homepage__hero__quote__text'>
          “{q.text}”
          <br />
          – <span className='uppercase'>{q.name}</span>
        </div>
      </div>
    )
  }
}

const MarketingHeader = p => (
  <div className='homepage__hero'>
    <div className='homepage__hero-title-container'>
      <h1 className='homepage__hero__title top-large-title'>
        <FormattedMessage {...m.app.Auth.privateEncryptedOnlineCommunication} />{' '}
        <nobr><FormattedMessage {...m.app.Auth.forEveryone} /></nobr>
      </h1>
    </div>

    <div className='homepage__hero__image'>
      <Link to='/register#top' activeClassName='active'>
        <Button className='homepage__hero__start_button'>
          <FormattedMessage {...m.app.Home.stayPrivateStartToday} />
        </Button>
      </Link>
      <div className='homepage__hero__image-container'>
        <img src={macBookLarge} className='homepage__hero__mac-image' />
      </div>
    </div>

    { !p.showQuotes ? null : <MarketingHeaderQuotes quotes={QUOTES} /> }
  </div>
)

MarketingHeader.propTypes = {
  showQuotes: PropTypes.bool
}

MarketingHeader.defaultProps = {
  showQuotes: false
}

export default MarketingHeader
