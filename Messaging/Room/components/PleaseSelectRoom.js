import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape, injectIntl } from 'react-intl'
import FAComments from 'react-icons/lib/fa/comments'

import m from 'commons/I18n'

import { getComposeHeight } from '../../utils'

class PleaseSelectRoom extends PureComponent {

  static propTypes = {
    intl: intlShape,
    composeHeight: PropTypes.number.isRequired
  }

  render () {
    const { intl, composeHeight } = this.props
    const fm = intl.formatMessage
    return (
      <div
        className='msging__room'
        style={{
          bottom: `${composeHeight}px`
        }}
      >
        <div className='msging__room__please-select'>
          <FAComments />
          <div className='msging__room__please-select__txt'>
            {fm(m.app.Chat.pleaseSelectRoom)}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  composeHeight: getComposeHeight(state)
})

const InjectedPleaseSelectRoom = injectIntl(PleaseSelectRoom)

const ConnectedPleaseSelectRoom = connect(mapStateToProps)(InjectedPleaseSelectRoom)

export default ConnectedPleaseSelectRoom
