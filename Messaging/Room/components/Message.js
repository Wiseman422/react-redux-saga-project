import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import FADownload from 'react-icons/lib/fa/download'
import FAFile from 'react-icons/lib/fa/file'
import { path } from 'ramda'

import ChatActions from 'commons/Redux/ChatRedux'

class Message extends PureComponent {

  static propTypes = {
    data: PropTypes.object.isRequired,
    identity: PropTypes.string.isRequired,
    groupStart: PropTypes.bool,
    saveMessageFile: PropTypes.func.isRequired,
    lastUser: PropTypes.string,
    momentTimeString: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    this._saveMessageFile = this._saveMessageFile.bind(this)
    this._renderFile = this._renderFile.bind(this)
    this._renderBody = this._renderBody.bind(this)
  }

  _saveMessageFile () {
    this.props.saveMessageFile(this.props.data.room_id, this.props.data.message_id)
  }

  _renderFile () {
    const { data } = this.props
    const out = []

    if (data.is_image) {
      out.push(<img key='image' src={`data:${data.data.mime_type};base64,${data.image_data}`} alt={data.data.file_name} />)
      out.push(
        <div key='download-icon' className='msging__message__text__image__download'>
          <FADownload />
        </div>
      )
    } else {
      out.push(
        <div key='file' className='msging__message__text__file'>
          <FAFile className='file' />
          <FADownload className='download' />
        </div>
      )
      out.push(
        <div key='filename' className='msging__message__text__filename'>{data.data.file_name}</div>
      )
    }

    return out
  }

  _renderBody () {
    const { data, identity } = this.props
    const {
      user_from: userFrom
    } = data
    const ownMessage = identity === userFrom
    const textClass = {
      'msging__message__text': true,
      'msging__message__text__own': ownMessage,
      'msging__message__text__guest': !ownMessage,
      'msging__message__text__action': data.is_action
    }

    if (data.is_image || data.is_url) {
      textClass['msging__message__text__image'] = true
      return (
        <div className={classnames(textClass)} onClick={this._saveMessageFile}>
          {this._renderFile()}
        </div>
      )
    }

    return (
      <pre className={classnames(textClass)}>
        {data.body}
      </pre>
    )
  }

  render () {
    const {
      data,
      identity,
      lastUser,
      momentTimeString
    } = this.props

    const groupStart = lastUser !== data.user_from

    const {
      user_from: userFrom
    } = data
    const ownMessage = identity === userFrom
    const messageClass = {
      'msging__message': true,
      'msging__message__own': ownMessage,
      'msging__message__guest': !ownMessage,
      'msging__message__group-start': groupStart
    }
    const arrowClass = {
      'msging__message__arrow': true,
      'msging__message__arrow__own': ownMessage,
      'msging__message__arrow__guest': !ownMessage
    }
    const timestampClass = {
      'msging__message__timestamp': true,
      'msging__message__timestamp__own': ownMessage,
      'msging__message__timestamp__guest': !ownMessage
    }
    return (
      <div className={classnames(messageClass)}>
        <div className='msging__message__content'>
          <div className='msging__message__bubble'>
            {this._renderBody()}
            <div className={classnames(arrowClass)} />
          </div>
          <div className={classnames(timestampClass)}>
            {momentTimeString}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {}
  props.data = path(['chat', 'data', ownProps.roomId, ownProps.isE2ee ? 'e2ee' : 'regular', 'messages', ownProps.messageId], state)
  return props
}

const mapDispatchToProps = {
  saveMessageFile: ChatActions.chatSaveMessageFile
}

const ConnectdMessage = connect(mapStateToProps, mapDispatchToProps)(Message)

export default ConnectdMessage
