import React, { PureComponent } from 'react'
import { intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n'

class NoMoreMessages extends PureComponent {

  static propTypes = {
    intl: intlShape
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <div className='msging__message msging__message__no-more-messages'>
        {fm(m.app.Chat.noMoreMessages)}
      </div>
    )
  }
}

const InjectedNoMoreMessages = injectIntl(NoMoreMessages)

export default InjectedNoMoreMessages
