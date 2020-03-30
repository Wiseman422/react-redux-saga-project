import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { change } from 'redux-form'
import debounce from 'debounce'
import classnames from 'classnames'

import ChatActions from 'commons/Redux/ChatRedux'
import { isWhitespace } from 'commons/Lib/Messaging'

import {
  MSG_COMPOSE_MIN_HEIGHT,
  MSG_COMPOSE_MAX_HEIGHT,
  MSG_COMPOSE_FORM_IDENTIFIER,
  MSG_COMPOSE_HEIGHT_FIELD
} from '../../constants'

class MessageComposeInput extends Component {

  static propTypes = {
    data: PropTypes.object,
    isE2ee: PropTypes.bool,
    input: PropTypes.object.isRequired,
    onHeightChange: PropTypes.func.isRequired,
    chatStartedTyping: PropTypes.func.isRequired,
    chatStoppedTyping: PropTypes.func.isRequired,

    // router
    params: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      height: MSG_COMPOSE_MIN_HEIGHT
    }

    this._isTyping = false

    this._ref = this._ref.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._renderValue = this._renderValue.bind(this)
    this._getInputHeight = this._getInputHeight.bind(this)
    this._updateHeight = this._updateHeight.bind(this)
    this._handleStartTyping = this._handleStartTyping.bind(this)
    this._handleStopTyping = debounce(this._handleStopTyping.bind(this), 1000)
  }

  _ref (n) {
    this.sizer = n
  }

  _getInputHeight () {
    const sizerHeight = this.sizer.offsetHeight
    if (sizerHeight < MSG_COMPOSE_MIN_HEIGHT) return MSG_COMPOSE_MIN_HEIGHT
    if (sizerHeight > MSG_COMPOSE_MAX_HEIGHT) return MSG_COMPOSE_MAX_HEIGHT
    return sizerHeight
  }

  _updateHeight () {
    const height = this._getInputHeight()
    if (height !== this.state.height) {
      this.setState({ height })
      this.props.onHeightChange(height)
    }
  }

  _handleStartTyping () {
    const { params, chatStartedTyping } = this.props
    if (!params.id || this._isTyping) return
    this._isTyping = true
    chatStartedTyping(params.id)
  }

  _handleStopTyping () {
    const { params, chatStoppedTyping } = this.props
    if (!params.id || !this._isTyping) return
    this._isTyping = false
    chatStoppedTyping(params.id)
  }

  _handleChange (...args) {
    this.props.input.onChange(...args)
    if (isWhitespace(args[0].target.value || '')) return
    this._handleStartTyping()
    this._handleStopTyping()
  }

  _renderValue () {
    const { value } = this.props.input
    const list = []
    const strings = value.split('\n')

    // if only whitespace, return empty string
    if (isWhitespace(value)) return ''

    // if only one line return value
    if (strings.length < 2) return value

    strings.forEach((string, i) => {
      list.push(<span key={i}>{string || 's'}</span>)
      if (i < strings.length - 1) {
        list.push(<br key={`${i}-br`} />)
      }
    })

    return list
  }

  componentDidUpdate (prevProps, prevState) {
    this._updateHeight()
  }

  render () {
    const { input, isE2ee } = this.props
    const inputClass = {
      'msging__compose__input': true,
      'msging__compose__input__with-file-upload': isE2ee
    }
    return (
      <div className={classnames(inputClass)}>
        <div className='msging__compose__input__sizer'>
          <div className='msging__compose__input__sizer__inner' ref={this._ref} >
            {this._renderValue()}
          </div>
        </div>
        <div className='msging__compose__input__textarea'>
          <textarea
            className='msging__compose__input__textarea__inner'
            autoComplete='off'
            {...input}
            onChange={this._handleChange}
          />
        </div>
      </div>
    )
  }

}

const mapDispatchToProps = {
  chatStartedTyping: ChatActions.chatStartedTyping,
  chatStoppedTyping: ChatActions.chatStoppedTyping,
  onHeightChange: (height) => change(MSG_COMPOSE_FORM_IDENTIFIER, MSG_COMPOSE_HEIGHT_FIELD, height)
}

const ConnectedMessageComposeInput = connect(null, mapDispatchToProps)(MessageComposeInput)

const MessageComposeInputWithRouter = withRouter(ConnectedMessageComposeInput)

export default MessageComposeInputWithRouter
