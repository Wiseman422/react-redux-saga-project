import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import FABan from 'react-icons/lib/fa/ban'
import FACircleONotch from 'react-icons/lib/fa/circle-o-notch'
import sanitizeHtml from 'sanitize-html'
import { FormattedMessage } from 'react-intl'
import debounce from 'debounce'

import m from 'commons/I18n/'
import { MSG_STATE } from 'commons/Redux/MailboxRedux'
import { getIconForMIMEType } from 'commons/Lib/MimeTypes'

const ImageLoadMessage = props => {
  const { showImages } = props

  return (
    <div className='mailbox-detail__option'>
      <FABan /> <FormattedMessage {...m.app.Mailbox.remoteImagesBlocked} />
      <span className='mailbox-detail__option__button' onClick={showImages}><FormattedMessage {...m.app.Mailbox.loadRemoteImages} /></span>
      <div className='clearfix' />
    </div>
  )
}

ImageLoadMessage.propTypes = {
  imagesPresent: PropTypes.bool,
  imagesVisible: PropTypes.bool,
  showImages: PropTypes.func.isRequired
}

const MSG_STATE_QUEUED = 36 // pending confirmtion/two_factor_send

class MailboxDetailBody extends Component {
  static propTypes = {
    data: PropTypes.object,
    imagesVisible: PropTypes.bool,
    embeddedVisible: PropTypes.bool,
    showImages: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    saveAttachment: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this._updateIframeSize = this._updateIframeSize.bind(this)
    this._debouncedUpdateIframeSize = debounce(this._updateIframeSize, 300)
  }

  _updateIframeSize () {
    if (this.iframeRef) {
      const el = ReactDOM.findDOMNode(this.iframeRef)
      let elDoc = (el.contentWindow || el.contentDocument)
      if (elDoc && elDoc.document) {
        elDoc = elDoc.document
        if (elDoc && elDoc.body) {
          el.style.height = elDoc.body.offsetHeight + 20 + 'px'
        }
      }
    }
  }

  componentDidMount () {
    // Add a resize listener and call this._debouncedUpdateIframeSize
    this._resizeListener = window.addEventListener('resize', this._debouncedUpdateIframeSize)

    // Saves a callback for downloading attachment on window (dirty dirty)
    window.saveAttachment = index => this.props.saveAttachment(this.props.data.id, index)
  }

  componentWillUnmount () {
    if (this._resizeListener) {
      document.removeEventListener('resize', this._debouncedUpdateIframeSize)
    }

    window.saveAttachment = null
  }

  render () {
    const { data, imagesVisible, embeddedVisible, showImages } = this.props

    if (data && !data.is_msgsafe_store) {
      let message = <FormattedMessage {...m.app.Mailbox.forwardedStateWithEmail} />
      if (data.msg_state === MSG_STATE.SEND_QUEUED) {
        let outboundRegion = 'CW'
        if (data.outbound_region) {
          outboundRegion = data.outbound_region
        }

        message = (
          <div className='z-help'>
            <FormattedMessage
              {...m.app.Mailbox.queuedSendState}
              values={{
                emailAddr: <b>{data.msg_to}</b>,
                idenEmail: <b>{data.msg_from}</b>,
                idenRegion: <span className='uppercase'>{outboundRegion}</span>
              }}
            />
          </div>
        )
      } else if (data.useremail_addr) {
        message = (
          <div className='z-help'>
            <FormattedMessage
              {...m.app.Mailbox.forwardedStateWithEmail }
              values={{
                emailAddr: data.useremail_addr
              }}
            />
          </div>
        )
      }

      return (
        <div className='mailbox-detail__body'>
          {message}
        </div>
      )
    } else if (data && (data.is_pgp_out || data.is_smime_out)) {
      return (
        <div className='mailbox-detail__body'>
          <FormattedMessage
            {...m.app.Mailbox.outboundEncryptedState }
          />
        </div>
      )

    } else if (data && !data.detail && data.detailStatus && data.detailStatus.error) {
      return (
        <div className='mailbox-detail__body'>
          Failed to retrieve mail. <a onClick={this.props.reload}>Retry</a>
        </div>
      )
    } else if (data && (!data.detail || data.detailStatus.inProgress)) {
      return (
        <div className='mailbox-detail__body'>
          <div className='mailbox-detail__body__loading'>
            <FACircleONotch className='spinning' />
            <FormattedMessage {...m.app.Mailbox.decryptingEmail} />
          </div>
        </div>
      )
    }

    let text = ''
    let remoteImagesPresent = false

    if (data.detail.html) {
      const attachmentTransform = (tagName, attribs) => {
        if (attribs.src && attribs.src.match(/^https?(.*)/)) {
          remoteImagesPresent = true
        }

        let imgSrc = null
        const contentIdKey = tagName === 'object' ? 'data' : 'src'
        const contentId = attribs[contentIdKey] && attribs[contentIdKey].replace(/cid:(.*)/, '$1')
        if (contentId && data.detail.attachments[contentId]) {
          const attachment = data.detail.attachments[contentId]

          // Render inline image
          if (attachment && attachment.isInlineImage && embeddedVisible) {
            imgSrc = `data:${attachment.contentType};base64,${attachment.data}`
            return {
              tagName: 'img',
              attribs: {
                ...attribs,
                src: imgSrc
              }
            }
          }

          // Render inline attachment link
          const contentIdIndex = data.detail.attachmentContentIds.indexOf(contentId)
          if (attachment && contentIdIndex !== -1 && embeddedVisible) {
            const iconMarkup = getIconForMIMEType(attachment.contentType, true)
            return {
              tagName: 'a',
              text: `${iconMarkup} ${attachment.name}`,
              attribs: {
                href: '#',
                class: 'mailbox-detail__body__iframe__link',
                onclick: `javascript: parent.saveAttachment(${contentIdIndex}); return false;`
              }
            }
          }
        }

        return { tagName, attribs }
      }

      const options = {
        transformTags: {
          // Add `target="_blank"` attribute on all anchor tags
          'a': sanitizeHtml.simpleTransform('a', { 'target': '_blank' }),
          'img': attachmentTransform,
          'object': attachmentTransform
        },
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'style', 'img', 'html', 'head', 'body', 'center', 'title', 'span', 'ins', 'del', 'sup', 'sub'
        ]),
        allowedAttributes: false,
        allowedSchemes: ['data', 'mailto'],
        allowedSchemesByTag: {
          a: ['http', 'https', 'mailto', 'ftp'],
          img: ['data']
        }
      }

      if (this.props.imagesVisible) {
        options.allowedSchemesByTag.img = options.allowedSchemesByTag.img.concat(['http', 'https', 'ftp'])
      }

      text = sanitizeHtml(data.detail.html, options)
    } else if (data.detail.plain) {
      text = data.detail.plain
      return (
        <div className='mailbox-detail__body'>
          <pre className='mailbox-detail__body__plain'>{text}</pre>
        </div>
      )
    }

    return (
      <div className='mailbox-detail__body'>
        { remoteImagesPresent && !imagesVisible ? (
          <ImageLoadMessage showImages={showImages} />
        ) : null}

        <iframe
          ref={r => { this.iframeRef = r }}
          srcDoc={text}
          className='mailbox-detail__body__iframe'
          frameBorder={0}
          onLoad={this._updateIframeSize}
        />
      </div>
    )
  }
}

export default MailboxDetailBody
