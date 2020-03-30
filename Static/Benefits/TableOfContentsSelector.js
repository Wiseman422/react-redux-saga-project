import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'

import m from 'commons/I18n'

import history from 'app/Routes/History'
import { toc } from './TableOfContents'

class TableOfContentsSelector extends Component {

  static propTypes = {
    intl: intlShape,
    location: PropTypes.object.isRequired
  }

  handleChange (ev) {
    const value = ev.target.value
    history.push(`${value}#benefits_top`)
  }

  render () {
    const fm = this.props.intl.formatMessage
    const pathname = this.props.location.pathname
    return (
      <div className='benefits__toc__selector'>
        <select value={pathname || '/benefits'} onChange={this.handleChange}>
          <option value='/benefits'>
            {fm(m.app.Benefits.tocTitle)}
          </option>
          {toc.map((page, i) =>
            <option key={i} value={page.path}>
              {fm(page.title)}
            </option>
          )}
        </select>
      </div>
    )
  }
}

const InjectedTableOfContentsSelector = injectIntl(TableOfContentsSelector)

const TableOfContentsSelectorWithRouter = withRouter(InjectedTableOfContentsSelector)

export default TableOfContentsSelectorWithRouter
