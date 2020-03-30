import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FASpinner from 'react-icons/lib/fa/spinner'

import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import log from 'commons/Services/Log'
import IdentityActions from 'commons/Redux/IdentityRedux'
import { chunkStr } from 'commons/Lib/Utils'
import { identifyKeys } from 'commons/Lib/Crypto'

import Button from 'app/Components/Button'
import { FullPageView } from 'app/Components/FullPageView'
import FeaturesSlider from './FeaturesSlider'

const REQUEST_MAILBOX_BACKOFF_MSEC = 4000
const WAIT_TILL_CERT_GEN_MSG_MSEC = 4000
const WAIT_TILL_WRAP_UP_MSG_MSEC = 40000 // solely for making it seem like "we are working on it"
const ONBOARDING_TIMEOUT_MSEC = 60000 // proceed no matter what

export class CreateIdentityCertGeneration extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    finish: PropTypes.func.isRequired,

    identityResult: PropTypes.object.isRequired,
    identityGenerateCrypto: PropTypes.func.isRequired,
    identitySendWelcome: PropTypes.func.isRequired,

    identityKeyData: PropTypes.object,
    identitySendWelcomeData: PropTypes.object,
    identityMailbox: PropTypes.func,
    identityMailboxData: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.identityKeyData = null
    this.numMailRecv = 0
    this.numWelcomeSent = 0
    this.smimeKey = null
    this.pgpKey = null
    this.wrappingUpTimoutKey = null
    this.certGenerationTimeoutKey = null
    this.onboardingTimeoutKey = null

    this.state = {
      complete: false,
      isCertGenerating: false,
      isWrappingUp: false
    }
  }

  _requestMailboxTotals () {
    const { identityResult } = this.props

    try {
      if (!identityResult) {
        return
      }
      const payload = { filter: { identity_id: identityResult.id }, limit: 1 }
      this.props.identityMailbox(payload)
    } catch (e) {
      log.debug('_requestMailboxTotals caught -', e)
    }
  }

  componentWillMount () {
    this.onboardingTimeoutKey = setTimeout(() => {
      this.setState({ complete: true })
    }, ONBOARDING_TIMEOUT_MSEC)

    // solely for making it seem like "we are working on it"
    this.wrappingUpTimoutKey = setTimeout(() => {
      this.setState({ isWrappingUp: true })
    }, WAIT_TILL_WRAP_UP_MSG_MSEC)
  }

  componentDidMount () {
    const { identityResult } = this.props

    if (!this.certGenerationTimeoutKey) {
      this.certGenerationTimeoutKey = setTimeout(() => {
        this.setState({ isCertGenerating: true })
      }, WAIT_TILL_CERT_GEN_MSG_MSEC)
    }

    try {
      if (!identityResult) {
        return
      }
      this.props.identityGenerateCrypto({id: identityResult.id})
    } catch (e) {
      log.debug('caught e=', e)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.onboardingTimeoutKey)
    clearTimeout(this.wrappingUpTimoutKey)
  }

  componentWillReceiveProps (nextProps) {
    // Crypto generate response
    if (this.props.identityKeyData !== nextProps.identityKeyData) {
      if (nextProps.identityKeyData !== null) {
        const { smimeKey, pgpKey } = identifyKeys(nextProps.identityKeyData.keys)
        if (!smimeKey || !pgpKey) {
          log.debug('invalid identityKeyData response -', nextProps.identityKeyData)
          return
        }
        this.smimeKey = smimeKey
        this.pgpKey = pgpKey
        this.setState({ isCertsGenerated: true })
        // Now send welcome letters
        this.props.identitySendWelcome({id: this.props.identityResult.id})
      }
    }

    // Welcome letter response
    if (this.props.identitySendWelcomeData !== nextProps.identitySendWelcomeData) {
      if (nextProps.identitySendWelcomeData !== null) {
        log.debug('identitySendWelcomeData=', nextProps.identitySendWelcomeData)

        // Base counters to use to know when system is done with notifications
        this.numMailRecv = nextProps.identitySendWelcomeData.num_mail_recv
        this.numWelcomeSent = nextProps.identitySendWelcomeData.num_welcome_sent

        // Kick-off requestMailboxTotal dance/wait
        this._requestMailboxTotals()
      }
    }

    if (this.state.complete) return

    // Identity mailbox check response
    if (this.props.identityMailboxData !== nextProps.identityMailboxData) {
      if (nextProps.identityMailboxData !== null) {
        log.debug('identityMailboxData=', nextProps.identityMailboxData)
        const d = nextProps.identityMailboxData

        // Keep checking if not complete
        if (d.total !== this.numWelcomeSent) {
          log.debug(`total=${d.total} numMailRecv=${this.numMailRecv} numWelcomeSent=${this.numWelcomeSent}`)
          setTimeout(() => this._requestMailboxTotals(), REQUEST_MAILBOX_BACKOFF_MSEC)
        } else {
          // User has mail! Allow to advance..
          this.setState({ complete: true })
        }
      }
    }
  }

  _renderFingerprints () {
    let smimeFingerprint = null
    let pgpFingerprint = null
    if (this.smimeKey && this.pgpKey) {
      smimeFingerprint = chunkStr(this.smimeKey.fingerprint, 4).join(' ')
      pgpFingerprint = chunkStr(this.pgpKey.fingerprint, 4).join(' ')
    } else {
      return null
    }
    return (
      <div className='cert-create__progress-container'>
        <div className='cert-create__progress'>
          <div className='z-form__label z-form__label--small'>S/MIME fingerprint</div>
          { smimeFingerprint && <div className='z-form__help'>{smimeFingerprint}</div> }
        </div>
        <div className='cert-create__progress cert-create__progress__last'>
          <div className='z-form__label z-form__label--small'>GPG fingerprint</div>
          { pgpFingerprint && <div className='z-form__help'>{pgpFingerprint}</div> }
        </div>
      </div>
    )
  }

  _renderComplete () {
    return (
      <div className='cert-create__success-container'>
        {this._renderFingerprints()}
        <div className='cert-create__success-message'>
          <Button btnStyle='success' onClick={this.props.finish}>
            <FormattedMessage {...m.app.Common.next} />
          </Button>
          <div className='z-form__success'>
            <FormattedMessage {...m.app.Identity.yourMailboxIsReady} />
          </div>
        </div>
      </div>
    )
  }

  _renderWaiting () {
    let progressMsg = <span><FormattedMessage {...m.app.Identity.creatingMailbox} />...</span>
    if (this.state.isCertGenerating) progressMsg = <span><FormattedMessage {...m.app.Identity.generatingCerts} />...</span>
    if (this.state.isCertsGenerated) progressMsg = <span><FormattedMessage {...m.app.Identity.verifyingMailbox} />...</span>
    if (this.state.isWrappingUp) progressMsg = <span><FormattedMessage {...m.app.Identity.wrappingUp} />...</span>
    return (
      <div className='cert-create__wait'>
        <div className='z-form__label'>
          <FormattedMessage {...m.app.Identity.certGenerationLabel1} />
        </div>
        <FASpinner className='spinning cert-create__wait__icon' /> {progressMsg}
        <div className='z-form__help'>
          <FormattedMessage
            {...m.app.Identity.certGenerationDesc1}
            values={{labelSMIME: 'S/MIME', labelGPG: 'GPG'}}
          />
        </div>
      </div>
    )
  }

  render () {
    const { intl } = this.props

    return (
      <FullPageView
        title={intl.formatMessage(m.app.Identity.creationPageTitle)}
        hideCloseButton
      >
        <div className='edit-view z-form z-form--alpha cert-create-container'>
          <div className='edit-view__body'>
            {this.state.complete ? this._renderComplete() : this._renderWaiting()}
            <hr />
            <FeaturesSlider />
          </div>
        </div>
      </FullPageView>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {
    identityKeyData: state.identity.api.identityGenerateCrypto.data,
    identitySendWelcomeData: state.identity.api.identitySendWelcome.data,
    identityMailboxData: state.identity.api.identityMailbox.data
  }
  return props
}

const mapDispatchToProps = {
  identityGenerateCrypto: IdentityActions.identityGenerateCryptoRequest,
  identitySendWelcome: IdentityActions.identitySendWelcomeRequest,
  identityMailbox: IdentityActions.identityMailboxRequest
}

const IntlInjected = injectIntl(CreateIdentityCertGeneration)
const CIdentityCert = connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
export default CIdentityCert
