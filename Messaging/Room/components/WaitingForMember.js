import React, { PureComponent } from 'react'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n'

class WaitingForMember extends PureComponent {
  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <div className='msging__room'>
        <div className='msging__room__loading-messages'>
          <div className='msging__room__loading-messages__txt'>
            {fm(m.app.Chat.waitingForMembers)}
          </div>
        </div>
      </div>
    )
  }
}

const InjectedWaitingForMember = injectIntl(WaitingForMember)

export default InjectedWaitingForMember
