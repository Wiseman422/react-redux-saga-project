import base64 from 'base-64'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FADownload from 'react-icons/lib/fa/download'

import { getIconForMIMEType, isImage, isText } from 'commons/Lib/MimeTypes'

const buildBase64URI = a => `data:${a.contentType};${a.encoding},${a.data}`

class ImageAttachment extends Component {
  static propTypes = {
    attachment: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      content: null
    }
  }

  componentWillMount () {
    const { attachment } = this.props

    const content = buildBase64URI(attachment)
    const img = new Image()

    img.onload = () => this.setState({
      content: content,
      imageWidth: img.width,
      imageHeight: img.height
    })

    img.src = content
  }

  render () {
    const { content } = this.state
    if (!content) return null

    return <img src={content} style={{maxWidth: '100%', height: 'auto'}} />
  }
}

const TextAttachment = props => (
  <div>{base64.decode(props.attachment.data)}</div>
)

TextAttachment.propTypes = {
  attachment: PropTypes.object
}

class MailboxDetailAttachmentItem extends Component {
  static propTypes = {
    attachment: PropTypes.object,
    saveAttachment: PropTypes.func.isRequired,
    mailId: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)

    this._toggleContentVisibility = this._toggleContentVisibility.bind(this)
    this._download = this._download.bind(this)

    this.canRender = null

    const mimeType = props.attachment.contentType

    if (isText(mimeType)) {
      this.canRender = 'text'
    } else if (isImage(mimeType)) {
      this.canRender = 'image'
    }

    this.state = {
      contentVisible: false,
      imageContent: null
    }
  }

  _toggleContentVisibility () {
    this.setState({ contentVisible: !this.state.contentVisible })
  }

  _renderContent () {
    if (!this.canRender || !this.state.contentVisible) return null

    const { attachment } = this.props

    if (this.canRender === 'text') {
      return (
        <div className='mailbox-detail__attachments__item__content mailbox-detail__attachments__item__content--text'>
          <TextAttachment attachment={attachment} />
        </div>
      )
    } else if (this.canRender === 'image') {
      return (
        <div className='mailbox-detail__attachments__item__content'>
          <ImageAttachment attachment={attachment} />
        </div>
      )
    }
  }

  _renderAction () {
    return null

    // if (!this.canRender) return null
    //
    // return (
    //   <div onClick={this._toggleContentVisibility} className='mailbox-detail__attachments__item__action'>
    //     { this.state.contentVisible ? <FAEyeSlash /> : <FAEye /> }
    //   </div>
    // )
  }

  _download () {
    this.props.saveAttachment(this.props.mailId, this.props.attachment.index)
  }

  render () {
    const { attachment } = this.props
    const Icon = getIconForMIMEType(attachment.contentType)

    return (
      <div className='mailbox-detail__attachments__item'>
        <div>
          <Icon className='mailbox-detail__attachments__item__icon' />
          <div className='mailbox-detail__attachments__item__title'>{attachment.name}</div>
          <a className='mailbox-detail__attachments__item__action' target='_blank' onClick={this._download}><FADownload /></a>
          { this._renderAction() }
        </div>
        { this._renderContent() }
      </div>
    )
  }
}

export default class MailboxDetailAttachments extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    saveAttachment: PropTypes.func.isRequired
  }

  render () {
    const { data } = this.props
    if (!data.detail || !data.detail.attachmentContentIds || !data.detail.attachmentContentIds) return null

    const nonInlineAttachmentIds = data.detail.attachmentContentIds.filter(id => !data.detail.attachments[id].isInline)
    if (!nonInlineAttachmentIds || !nonInlineAttachmentIds.length) return null

    const items = nonInlineAttachmentIds.map((id, i) => (
      <MailboxDetailAttachmentItem
        key={i}
        mailId={data.id}
        attachment={data.detail.attachments[id]}
        saveAttachment={this.props.saveAttachment}
      />
    ))

    return (
      <div className='mailbox-detail__attachments'>
        {items}
      </div>
    )
  }
}
