import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { reduxForm, Field, change, focus } from 'redux-form'
import FAPaperPlane from 'react-icons/lib/fa/paper-plane'
import classnames from 'classnames'

import ChatActions from 'commons/Redux/ChatRedux'
import { isWhitespace } from 'commons/Lib/Messaging'
import { isRoomE2EEWithoutOtherMembers } from 'commons/Selectors/Messaging'

import {
  MSG_COMPOSE_FORM_IDENTIFIER,
  MSG_COMPOSE_HEIGHT_FIELD,
  MSG_COMPOSE_MESSAGE_FIELD
} from '../constants'
import { getComposeHeight } from '../utils'
import ComposeInput from './components/Input'
import FileUpload from './components/FileUpload'

class MessageCompose extends Component {

  static propTypes = {
    data: PropTypes.object,
    isE2ee: PropTypes.bool,
    roomDetailOpen: PropTypes.bool,
    // redux-form props
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    composeHeight: PropTypes.number.isRequired,

    // whether room is e2ee without any other members
    roomIsE2EEWithoutOtherMembers: PropTypes.bool
  }

  _renderSubmitButton () {
    const { data, pristine, roomIsE2EEWithoutOtherMembers } = this.props
    const enabled = !pristine && data.room_id && !roomIsE2EEWithoutOtherMembers
    const buttonClass = {
      'msging__compose__submit': true,
      'msging__compose__submit__disabled': !enabled
    }
    return (
      <button
        type='submit'
        className={classnames(buttonClass)}
        disabled={!enabled}
      >
        <FAPaperPlane />
      </button>
    )
  }

  render () {
    const { data, handleSubmit, composeHeight } = this.props
    if (!data || !data.room_id) return null
    const composeClass = {
      'msging__compose': true,
      'msging__compose__room-detail-open': this.props.roomDetailOpen
    }
    return (
      <form
        className={classnames(composeClass)}
        onSubmit={handleSubmit}
        style={{
          height: `${composeHeight}px`
        }}
      >
        <FileUpload {...this.props} />
        <Field name={MSG_COMPOSE_MESSAGE_FIELD} component={ComposeInput} data={data} isE2ee={this.props.isE2ee} />

        {
        /**
         * We keep this hidden field only to make the calculated height of the
         * message compose form available in redux store through redux-form api
         */
        }
        <Field name={MSG_COMPOSE_HEIGHT_FIELD} type='hidden' component='input' />
        {this._renderSubmitButton()}
      </form>
    )
  }
}

const MessageComposeForm = reduxForm({
  form: MSG_COMPOSE_FORM_IDENTIFIER,
  onSubmit: function (values, dispatch, props) {
    const message = values[MSG_COMPOSE_MESSAGE_FIELD]
    const sendMessage = ChatActions.chatSendMessageRequest
    const stopTyping = ChatActions.chatStoppedTyping
    dispatch(change(MSG_COMPOSE_FORM_IDENTIFIER, MSG_COMPOSE_MESSAGE_FIELD, ''))
    dispatch(focus(MSG_COMPOSE_FORM_IDENTIFIER, MSG_COMPOSE_MESSAGE_FIELD))
    if (!props.data || !props.data.room_id) return
    if (!message || isWhitespace(message)) return
    dispatch(stopTyping(props.data.room_id))
    dispatch(sendMessage(props.data.room_id, message, props.isE2ee))
  },
  validate: (values, props) => {
    const errors = {}
    if (!props.data || !props.data.room_id || props.roomIsE2EEWithoutOtherMembers) {
      errors['compose-text'] = 'no!'
    }
    return errors
  }
})(MessageCompose)

const mapStateToProps = (state, ownProps) => {
  const composeHeight = getComposeHeight(state)
  const props = {
    composeHeight
  }
  if (ownProps.data) {
    props.roomIsE2EEWithoutOtherMembers = isRoomE2EEWithoutOtherMembers(state, ownProps.data.room_id)
  }
  props.initialValues = {
    [MSG_COMPOSE_MESSAGE_FIELD]: '',
    [MSG_COMPOSE_HEIGHT_FIELD]: composeHeight
  }
  return props
}

const ConnectedMessageComposeForm = connect(mapStateToProps)(MessageComposeForm)

export default ConnectedMessageComposeForm
