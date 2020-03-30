import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { path } from 'ramda'
import Link from 'react-router/lib/Link'
import classNames from 'classnames'
import FABars from 'react-icons/lib/fa/bars'
import FAPlus from 'react-icons/lib/fa/plus'
import FaEnvelopeO from 'react-icons/lib/fa/envelope-o'
import IconTooltip from 'app/Components/IconTooltip'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'

import { getCommonListReduxValues, commonListReduxValueProps } from 'commons/Redux/_Utils'
import { timeAgo } from 'commons/Lib/Utils'
import m from 'commons/I18n/'
import ax from 'commons/Services/Analytics/index'

import Button from 'app/Components/Button'
import history from 'app/Routes/History'
import ListView from 'app/Components/ListView'
import Actions, { REDUX_CONFIG } from 'commons/Redux/IdentityRedux'
import NameEmail from 'app/Components/NameEmail'
import EmptyList from 'app/Components/ListView/components/EmptyList'
import DrawerActions from 'app/Redux/DrawerRedux'

class _Identity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    timezone: PropTypes.string,
    fetchData: PropTypes.func,
    clearSearchResultsData: PropTypes.func,
    setSearchQuery: PropTypes.func,
    autoUpdate: PropTypes.func,
    isGTSmScreen: PropTypes.bool,
    isGTMdScreen: PropTypes.bool,
    emailAvatars: PropTypes.object,
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

    // Open first item if on large screen
    if (
      this.props.params && !this.props.params.id &&
      !this.props.enableItemSelection && this.props.isGTMdScreen &&
      this.props.dataOrder && this.props.dataOrder[0]
    ) {
      history.push(`/identity/${this.props.dataOrder[0]}`)
      return
    }

    ax.listPageView(ax.EVENTS.IDENTITY)
  }

  componentWillReceiveProps (nextProps) {
    // Open first item if on large screen
    if (nextProps.params && !nextProps.params.id && !nextProps.enableItemSelection && nextProps.isGTMdScreen && !this.props.dataOrder && nextProps.dataOrder && nextProps.dataOrder[0]) {
      history.push(`/identity/${nextProps.dataOrder[0]}`)
    }
  }

  _renderEmptyList () {
    return (
      <EmptyList icon={<FaEnvelopeO size='60' />}>
        <p><FormattedMessage {...m.app.Identity.emptyList} /></p>
        <Link to='/identity/new'>
        <Button btnStyle='success' type='button'>
          <FormattedMessage {...m.app.Identity.newMailbox } />
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
    return (
      <Link key={data.id} className={classes} to={enableItemSelection ? null : `/identity/${data.id}`}>
        <div className='list-item__timestamp'>{timeAgo(data.last_activity_on, intl, timezone)}</div>
        <NameEmail
          name={data.display_name}
          email={data.email}
          image={this.props.emailAvatars[data.email]}
          nameClassName='list-item__name'
          emailClassName='list-item__email'
          domainClassName='list-item__domain'
          avatarClassName='list-item__avatar'
          highlightEmailAsName
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
        key='identityDrawer'
        onClick={this.props.openIdentityDrawer}
      >
        <FABars />
      </span>
    ]
    const bottomToolbarRightItems = [
      <Link
        className='toolbar__option toolbar__option--icon'
        to='/identity/new'
        key='newIdentity'
      >
        <IconTooltip placement='bottom' trans={m.app.Tooltips.add} icon={FAPlus} />
      </Link>
    ]

    return (
      <ListView
        title={intl.formatMessage(m.app.Identity.listTitle)}
        titleIcon={!isGTSmScreen ? FABars : null}
        titleOnClick={!isGTSmScreen ? this.props.openIdentityDrawer : null}
        renderElement={this._renderItem}
        getElementHeight={this._getItemHeight}
        renderEmptyList={this._renderEmptyList}
        bottomToolbarLeftItems={bottomToolbarLeftItems}
        bottomToolbarRightItems={bottomToolbarRightItems}
        createPath='/identity/new'
        {...this.props}
      />
    )
  }
}

const mapStateToProps = state => ({
  ...getCommonListReduxValues(state, REDUX_CONFIG.statePrefix),
  isGTSmScreen: path(['browser', 'greaterThan', 'sm'], state),
  isGTMdScreen: path(['browser', 'greaterThan', 'md'], state),
  emailAvatars: path(['avatar', 'emails'], state),
  timezone: state.user.data.timezone
})

const mapDispatchToProps = {
  fetchData: Actions.identityFetch,
  clearSearchResultsData: Actions.identityClearSearchData,
  setSearchQuery: Actions.identitySetSearchQuery,
  autoUpdate: Actions.identityAutoUpdateRequest,
  openIdentityDrawer: DrawerActions.openIdentityDrawer
}

const IntlInjected = injectIntl(_Identity)
export default connect(mapStateToProps, mapDispatchToProps)(IntlInjected)
