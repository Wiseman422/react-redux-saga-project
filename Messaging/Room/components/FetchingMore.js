import React, { Component } from 'react'
import FASpinner from 'react-icons/lib/fa/circle-o-notch'

class FetchingMore extends Component {
  render () {
    return (
      <div className='msging__message msging__message__loading'>
        <FASpinner className='spinning' />
      </div>
    )
  }
}

export default FetchingMore
