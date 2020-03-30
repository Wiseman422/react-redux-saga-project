import React, { PureComponent } from 'react'
import FASpinner from 'react-icons/lib/fa/circle-o-notch'

class RoomListInProgress extends PureComponent {
  render () {
    return (
      <div className='msging__room-list__in-progress'>
        <FASpinner className='spinning' />
      </div>
    )
  }
}

export default RoomListInProgress
