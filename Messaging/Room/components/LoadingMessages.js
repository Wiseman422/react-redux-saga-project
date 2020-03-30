import React, { PureComponent } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import FASpinner from 'react-icons/lib/fa/circle-o-notch'

import m from 'commons/I18n'

class LoadingMessages extends PureComponent {
  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <div className='msging__room'>
        <div className='msging__room__loading-messages'>
          <FASpinner className='spinning' />
          <div className='msging__room__loading-messages__txt'>
            {fm(m.app.Chat.loadingMessages)}
          </div>
        </div>
      </div>
    )
  }
}

const InjectedLoadingMessages = injectIntl(LoadingMessages)

export default InjectedLoadingMessages
