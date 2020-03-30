import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { path } from 'ramda'
import Link from 'react-router/lib/Link'
import FABars from 'react-icons/lib/fa/bars'
import FAPlus from 'react-icons/lib/fa/plus'
import FAEnvelopeO from 'react-icons/lib/fa/envelope-o'
import FAExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'
import { getCommonListReduxValues, commonListReduxValueProps } from 'commons/Redux/_Utils'

import Button from 'app/Components/Button'
import history from 'app/Routes/History'
import ListView from 'app/Components/ListView'
import Actions, { REDUX_CONFIG } from 'commons/Redux/UserEmailRedux'
import NameEmail from 'app/Components/NameEmail'
import EmptyList from 'app/Components/ListView/components/EmptyList'
import IconTooltip from 'app/Components/IconTooltip'

import { timeAgo } from 'commons/Lib/Utils'
import DrawerActions from 'app/Redux/DrawerRedux'

class _ForwardAddress extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    timezone: PropTypes.string,
    fetchData: PropTypes.func,
    clearSearchResultsData: PropTypes.func,
    setSearchQuery: PropTypes.func,
    autoUpdate: PropTypes.func,
    isGTSmScreen: PropTypes.bool,
    isGTMdScreen: PropTypes.bool,
    ...commonListReduxValueProps
  }

  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  componentDidMount () {
    if (this.props.data) {
      this.props.autoUpdate()
    }

    if (
      this.props.params && !this.props.params.id &&
      this.props.isGTMdScreen &&
      this.props.dataOrder && this.props.dataOrder[0]
    ) {
      history.push(`/esp/${this.props.dataOrder[0]}`)
      return
    }

    ax.listPageView(ax.EVENTS.FORWARD_ADDRESS)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params && !nextProps.params.id && nextProps.isGTMdScreen && !this.props.dataOrder && nextProps.dataOrder && nextProps.dataOrder[0]) {
      history.push(`/esp/${nextProps.dataOrder[0]}`)
    }
  }

  _renderEmptyList () {
    return (
      <EmptyList icon={<FAEnvelopeO size='60' />}>
        <p><FormattedMessage {...m.app.ForwardAddress.emptyList} /></p>
        <Link to='/esp/new'>
          <Button btnStyle='success' type='button'>
            <FormattedMessage { ...m.app.ForwardAddress.newForwardAddress } />
          </Button>
        </Link>
      </EmptyList>
    )
  }

  _renderItem (data, params, intl, enableItemSelection) {
    const classes = classNames({
      'list-item': true,
      'active': params && params.id && parseInt(params.id) === data.id
    })
    const { timezone } = this.props
    let dateCol = data.last_activity_on !== null ? data.last_activity_on : data.created_on
    let unconfirmedOrTimeAgo = null
    if (!data.is_confirmed) {
      unconfirmedOrTimeAgo = (
        <span className='red-icon'>
          <IconTooltip
            trans={m.app.ForwardAddress.addressNotConfirmed} icon={FAExclamationTriangle}
          />
        </span>
      )
    } else {
      unconfirmedOrTimeAgo = timeAgo(dateCol, intl, timezone)
    }

    return (
      <Link key={data.id} className={classes} to={enableItemSelection ? null : `/esp/${data.id}`}>
        <div className='list-item__timestamp'>{unconfirmedOrTimeAgo}</div>
        <NameEmail
          name={data.display_name}
          email={data.email}
          nameClassName='list-item__name'
          emailClassName='list-item__email'
          domainClassName='list-item__domain'
          avatarClassName='list-item__avatar'
          highlistEmailAsName
          avatar
        />
      </Link>
    )
  }

  _getItemHeight (data) {
    return NameEmail.getHeight(data.display_name, data.email)
  }

  render () {
    const { intl, isGTSmScreen } = this.props

    const bottomToolbarLeftItems = [
      <span
        className='toolbar__option toolbar__option--icon'
        key='forwardAddressDrawer'
        onClick={this.props.openUseremailDrawer}
      >
        <FABars />
      </span>
    ]

    const bottomToolbarRightItems = [
      <Link
        className='toolbar__option toolbar__option--icon'
        to='/esp/new'
        key='newForwardAddress'
      >
        <IconTooltip placement='bottom' trans={m.app.Tooltips.add} icon={FAPlus} />
      </Link>
    ]

    return (
      <ListView
        title={intl.formatMessage(m.app.ForwardAddress.listTitle)}
        titleIcon={!isGTSmScreen ? FABars : null}
        titleOnClick={!isGTSmScreen ? this.props.openUseremailDrawer : null}
        renderElement={this._renderItem}
        getElementHeight={this._getItemHeight}
        renderEmptyList={this._renderEmptyList}
        bottomToolbarLeftItems={bottomToolbarLeftItems}
        bottomToolbarRightItems={bottomToolbarRightItems}
        createPath='/esp/new'
        {...this.props}
      />
    )
  }
}

const mapStateToProps = state => ({
  ...getCommonListReduxValues(state, REDUX_CONFIG.statePrefix),
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
  timezone: state.user.data.timezone
})

const mapDispatchToProps = {
  fetchData: Actions.useremailFetch,
  clearSearchResultsData: Actions.useremailClearSearchData,
  setSearchQuery: Actions.useremailSetSearchQuery,
  autoUpdate: Actions.useremailAutoUpdateRequest,
  openUseremailDrawer: DrawerActions.openUseremailDrawer
}

const IntlInjected = injectIntl(_ForwardAddress)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
