import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Modal from 'react-modal'

import m from 'commons/I18n'

import Button from 'app/Components/Button'
import { TermsContent } from 'app/Containers/Static/Terms'

class TermsModal extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    closeModal: PropTypes.func
  }

  componentWillMount () {
    Modal.setAppElement('body')
  }

  render () {
    return (
      <Modal
        isOpen={this.props.isOpen}
        className='z-modal__content'
        overlayClassName='z-modal__overlay'
        contentLabel=' '
      >
        <div className='z-modal__title'>
          <FormattedMessage {...m.app.Common.pleaseReviewTerms} />
        </div>

        <div className='z-modal__long-content'>
          <TermsContent />
        </div>

        <div className='z-modal__bold-message'>
          <FormattedMessage {...m.app.Common.termsAcknowledgement} />
        </div>

        <div className='z-modal__buttons'>
          <Button
            small
            className='z-modal__button'
            onClick={this.props.closeModal}
          >
            <FormattedMessage {...m.app.Common.close} />
          </Button>
        </div>
      </Modal>
    )
  }
}

export default TermsModal
