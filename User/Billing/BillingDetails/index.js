import React from 'react'
import PropTypes from 'prop-types'
import FABars from 'react-icons/lib/fa/bars'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import classnames from 'classnames'
import m from 'commons/I18n/'

/**
 * A generic list view with support for search and pagination.
 *
 */
class _BillingDetails extends React.Component {
  // Pass the redux store values and action creators
  // directly for the give list (e.g. mailbox, identity, contact, etc)
  static propTypes = {
    children: PropTypes.any,
    isMediumScreen: PropTypes.bool,
    title: PropTypes.string.isRequired,
    titleOnClick: PropTypes.func,
    dataFetchInProgress: PropTypes.bool,
    intl: intlShape.isRequired,
    totalCount: PropTypes.number
  }

  _renderBottomToolbar () {
    const {
      dataFetchInProgress,
      intl,
      totalCount
    } = this.props

    let message = ''
    if (dataFetchInProgress) {
      message = intl.formatMessage(m.app.Common.loadingEllipses)
    } else if (totalCount === 0) {
      message = <FormattedMessage {...m.app.Common.listItemsNotFound} />
    } else if (totalCount > 0) {
      message = <FormattedMessage {...m.app.Common.listItems} values={{nItems: totalCount}} />
    }

    return (
      <div className='toolbar-container--bottom'>
        <div className='toolbar'>
          {' '}
          <div className={classnames({
            'toolbar__option': true,
            'toolbar__option--text': true,
            'toolbar__option--only-option': true
          })}>
            {message}
          </div>
          {' '}
        </div>
      </div>
    )
  }

  render () {
    const {
      title,
      titleOnClick,
      children,
      isMediumScreen
    } = this.props

    return (
      <div className='billing-details'>
        <div className='page-header'>
          <h1 className='page-header__title' onClick={titleOnClick}>
            {!isMediumScreen && <FABars className='page-header__title__icon' />}
            {title}
          </h1>
          <div className='clearfix' />
        </div>
        {children}
        {this._renderBottomToolbar()}
      </div>
    )
  }
}

export default injectIntl(_BillingDetails)
