import {
  MSG_COMPOSE_MIN_HEIGHT,
  MSG_COMPOSE_FORM_IDENTIFIER,
  MSG_COMPOSE_HEIGHT_FIELD
} from './constants'

export const getComposeHeight = (state) => {
  if (
    !state.form ||
    !state.form[MSG_COMPOSE_FORM_IDENTIFIER] ||
    !state.form[MSG_COMPOSE_FORM_IDENTIFIER].values ||
    !state.form[MSG_COMPOSE_FORM_IDENTIFIER].values[MSG_COMPOSE_HEIGHT_FIELD]
  ) {
    return MSG_COMPOSE_MIN_HEIGHT
  }
  return parseFloat(state.form[MSG_COMPOSE_FORM_IDENTIFIER].values[MSG_COMPOSE_HEIGHT_FIELD])
}
