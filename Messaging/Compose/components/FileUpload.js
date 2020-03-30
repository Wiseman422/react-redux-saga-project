import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FAAttachment from 'react-icons/lib/fa/paperclip'
import FASpinner from 'react-icons/lib/fa/circle-o-notch'
import Dropzone from 'react-dropzone'

import ChatActions from 'commons/Redux/ChatRedux'
import { promiseUint8ArrayDataFromFile } from 'commons/Lib/FileReader'

class ComposeFileUpload extends Component {

  static propTypes = {
    data: PropTypes.object,
    isE2ee: PropTypes.bool,
    chatSendFileRequest: PropTypes.func.isRequired,
    chatMessageModified: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this._handleFileAdd = this._handleFileAdd.bind(this)
    this._handleUploadProgress = this._handleUploadProgress.bind(this)
    this._isDisabled = this._isDisabled.bind(this)
    this._renderLoader = this._renderLoader.bind(this)
    this._renderDropzone = this._renderDropzone.bind(this)
  }

  _handleFileAdd (files) {
    if (this._isDisabled()) {
      return this
    }
    const file = files[0]
    promiseUint8ArrayDataFromFile(file)
      .then(data => {
        this.props.chatSendFileRequest(this.props.data.room_id, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: data
        }, this._handleUploadProgress)
      })
  }

  _handleUploadProgress (message) {
    const { chatMessageModified } = this.props
    chatMessageModified(message, true)
  }

  _isDisabled () {
    const { uploadingFiles } = this.props.data
    return uploadingFiles && uploadingFiles.length
  }

  _renderLoader () {
    return (
      <div className='msging__compose__attach'>
        <div className='svg'>
          <FASpinner className='spinning msging__compose__attach__disabled' />
        </div>
      </div>
    )
  }

  _renderDropzone () {
    return (
      <Dropzone className='msging__compose__attach' onDrop={this._handleFileAdd} disablePreview>
        <div className='svg'>
          <FAAttachment />
        </div>
      </Dropzone>
    )
  }

  render () {
    const { data, isE2ee } = this.props
    if (!data || !data.room_id || !isE2ee) return null
    if (this._isDisabled()) {
      return this._renderLoader()
    } else {
      return this._renderDropzone()
    }
  }

}

const mapDispatchToProps = {
  chatSendFileRequest: ChatActions.chatSendFileRequest,
  chatMessageModified: ChatActions.chatMessageModified
}

const ConnectedComposeFileUpload = connect(null, mapDispatchToProps)(ComposeFileUpload)

export default ConnectedComposeFileUpload
