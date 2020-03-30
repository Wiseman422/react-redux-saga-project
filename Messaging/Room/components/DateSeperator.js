import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class DateSeperator extends PureComponent {
  static propTypes = {
    children: PropTypes.any
  }

  render () {
    const { children } = this.props
    return (
      <div className='msging__message msging__message__date-seperator'>
        <div className='msging__message__date-seperator__inner'>
          {children}
        </div>
      </div>
    )
  }
}

export default DateSeperator
