import React from 'react'
import PropTypes from 'prop-types'
import FACloud from 'react-icons/lib/fa/cloud'
import FAPencil from 'react-icons/lib/fa/pencil'
import FAEnvelope from 'react-icons/lib/fa/envelope'

import { getLocalTimeForUTC } from 'commons/Lib/Utils'

const renderHopTime = (time, intl) => {
  const localTime = getLocalTimeForUTC(time)
  const dateString = intl.formatDate(localTime, { day: 'numeric', month: 'short', year: 'numeric' })
  const timeString = intl.formatTime(localTime)
  return `${dateString}, ${timeString}`
}

const MailboxDetailAnalyticsHops = props => {
  const fromNode = (
    <li className='mailbox-detail__analytics__hops__item'>
      <FAPencil className='mailbox-detail__analytics__hops__item__icon' />
      <div className='mailbox-detail__analytics__hops__item__content'>
        <div className='mailbox-detail__analytics__hops__item__title'>{props.data.msg_from}</div>
        <div className='mailbox-detail__analytics__hops__item__timestamp'>{renderHopTime(props.data.created_on, props.intl)}</div>
      </div>
    </li>
  )

  const toNode = (
    <li className='mailbox-detail__analytics__hops__item'>
      <FAEnvelope className='mailbox-detail__analytics__hops__item__icon' />
      <div className='mailbox-detail__analytics__hops__item__content'>
        <div className='mailbox-detail__analytics__hops__item__title'>{props.data.msg_to}</div>
        <div className='mailbox-detail__analytics__hops__item__timestamp'>
          {renderHopTime(props.data.analytics.whois[props.data.analytics.whois.length - 1].created, props.intl)}
        </div>
      </div>
    </li>
  )

  const hops = props.data.analytics.whois.map(rec => (
    <li key={rec.id} className='mailbox-detail__analytics__hops__item'>
      <FACloud className='mailbox-detail__analytics__hops__item__icon' />
      <div className='mailbox-detail__analytics__hops__item__content'>
        <div className='mailbox-detail__analytics__hops__item__title'>{rec.as_org_name}</div>
        <div className='mailbox-detail__analytics__hops__item__timestamp'>{renderHopTime(rec.created, props.intl)}</div>
      </div>
    </li>
  ))

  return (
    <ul className='mailbox-detail__analytics__hops'>
      {fromNode}
      {hops}
      {toNode}
    </ul>
  )
}

MailboxDetailAnalyticsHops.propTypes = {
  data: PropTypes.object,
  intl: PropTypes.object
}

export default MailboxDetailAnalyticsHops
