import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import FACircleONotch from 'react-icons/lib/fa/circle-o-notch'

import m from 'commons/I18n/'

const InvoiceDetails = p => {
  let finalPrice

  if (p.finalPriceData.inProgress) {
    finalPrice = <FACircleONotch className='spinning' />
  } else if (!p.finalPriceData.data) {
    finalPrice = '–'
  } else {
    finalPrice = `$${p.finalPriceData.data}`
  }

  // Coupon is only allowed for users on free plan, thus if user is not on free plan
  // then the discount amount is prorated
  const discountDescription = p.currentPlanName === 'free' ? m.app.User.userCouponAdjustment : m.app.User.proratedAdjustment

  return (
    <div className='plan-selection__invoice'>
      <div className='z-form__label'>
        <FormattedMessage {...m.app.Common.invoiceDetails} />
      </div>
      <div className='z-form__indent'>
        <div className='plan-selection__invoice__item'>
          <FormattedMessage {...m.app.User.recurringPlanSubscription} />
          <span className='pull-right'>{p.price ? `$${p.price}` : '–'}</span>
        </div>
        { (!p.finalPriceData.data || p.price === p.finalPriceData.data) ? null : (
          <div className='plan-selection__invoice__item'>
            <FormattedMessage {...discountDescription} />
            <span className='pull-right'>${(p.price - p.finalPriceData.data)}</span>
          </div>
        )}
        <div className='plan-selection__invoice__total'>
          <FormattedMessage {...m.app.Common.totalForPayment} />
          <span className='pull-right'>{finalPrice}</span>
        </div>
      </div>
    </div>
  )
}

InvoiceDetails.propTypes = {
  currentPlanName: PropTypes.string,
  price: PropTypes.number,
  finalPriceData: PropTypes.object
}

export default InvoiceDetails
