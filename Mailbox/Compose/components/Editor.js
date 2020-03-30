import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FACaretDown from 'react-icons/lib/fa/caret-down'
import FACaretUp from 'react-icons/lib/fa/caret-up'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import debounce from 'debounce'

import m from 'commons/I18n/'
import { getWindowHeight, getWindowWidth } from 'commons/Lib/Utils'

const TOOLBAR_OPTIONS = {
  options: ['inline', 'fontSize', 'list', 'textAlign', 'link', 'history'],
  textAlign: {
    options: ['left', 'center', 'right']
  },
  list: {
    options: ['unordered', 'ordered']
  }
}

class MailboxComposeEditor extends Component {
  static propTypes = {
    intl: intlShape,
    isGTMdScreen: PropTypes.bool,
    initialEditorState: PropTypes.object,
    setEditorState: PropTypes.func
  }

  constructor (props) {
    super(props)

    this._toggleMobileEditorVisibility = debounce(this._toggleMobileEditorVisibility.bind(this), 300)

    this.state = {
      isEditorAvailable: false,
      isMobileEditorVisible: false
    }
  }

  _setWYSIWYGHeight () {
    const nodes = document.getElementsByClassName('mailbox-compose__wysiwyg__editor')
    if (!nodes || nodes.length === 0) return

    const windowHeight = getWindowHeight()
    const windowWidth = getWindowWidth()

    let node = nodes[0]
    let height = windowHeight - node.offsetTop
    if (windowWidth >= 768) {
      const footerNodes = document.getElementsByClassName('app__footer')
      const bottomToolbarNodes = document.getElementsByClassName('full-page-view__toolbar')

      if (footerNodes && footerNodes.length > 0) {
        height -= footerNodes[0].offsetHeight
      }

      if (bottomToolbarNodes && bottomToolbarNodes.length > 0) {
        height -= bottomToolbarNodes[0].offsetHeight
      }
    }

    if (height <= 0) return

    if (windowWidth >= 768) {
      node.style['height'] = `${height}px`
      node.style['min-height'] = '0'
    } else {
      node.style['height'] = 'auto'
      node.style['min-height'] = `${height}px`
    }
  }

  _toggleMobileEditorVisibility () {
    this.setState({
      isMobileEditorVisible: !this.state.isMobileEditorVisible
    }, this._setWYSIWYGHeight)
  }

  componentWillMount () {
    // Dynamically load react-draft-wysiwyg and then render editor
    require.ensure(['react-draft-wysiwyg'], () => {
      require('react-draft-wysiwyg/dist/react-draft-wysiwyg.css')
      this.Editor = require('react-draft-wysiwyg').Editor
      this.setState({ isEditorAvailable: true })
      setTimeout(this._setWYSIWYGHeight, 500)
      setTimeout(this._setWYSIWYGHeight, 1000)
    })
  }

  componentDidMount () {
    this._resizeListener = window.addEventListener('resize', this._setWYSIWYGHeight)
    setTimeout(this._setWYSIWYGHeight, 500)
    setTimeout(this._setWYSIWYGHeight, 1000)
  }

  componentWillUnmount () {
    if (this._resizeListener) {
      document.removeEventListener('resize', this._setWYSIWYGHeight)
    }
  }

  render () {
    if (!this.state.isEditorAvailable) {
      return (
        <div className='mailbox-compose__wysiwyg__loading'>
          <FormattedMessage {...m.app.Mailbox.composeBodyEditorLoading} />
        </div>
      )
    }

    const toggle = this.props.isGTMdScreen ? null : (
      <div
        className='mailbox-compose__wysiwyg__toggle'
        onClick={this._toggleMobileEditorVisibility}
      >
        {this.state.isMobileEditorVisible ? <FACaretUp /> : <FACaretDown />}
      </div>
    )

    const toolbarStyle = (this.props.isGTMdScreen || this.state.isMobileEditorVisible)
      ? {}
      : {display: 'none'}

    return (
      <div className='mailbox-compose__wysiwyg__container'>
        { toggle }
        <this.Editor
          ref='wysiwyg'
          toolbar={TOOLBAR_OPTIONS}
          toolbarStyle={toolbarStyle}
          placeholder={this.props.intl.formatMessage(m.app.Mailbox.composeBodyFieldPlaceholder)}
          defaultEditorState={this.props.initialEditorState}
          onEditorStateChange={this.props.setEditorState}
          wrapperClassName='mailbox-compose__wysiwyg'
          toolbarClassName='mailbox-compose__wysiwyg__toolbar'
          editorClassName='mailbox-compose__wysiwyg__editor'
        />
      </div>
    )
  }
}

export default injectIntl(MailboxComposeEditor)
