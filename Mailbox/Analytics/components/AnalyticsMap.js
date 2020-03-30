import React from 'react'
import PropTypes from 'prop-types'
import L from 'leaflet'
import 'leaflet-polylinedecorator'

import LeafletMap from 'app/Components/LeafletMap'

const icon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
  iconSize: L.point(32, 32),
  iconAnchor: L.point(16, 32),
  popupAnchor: L.point(0, -32)
})

// Create the arrow head pattern
const arrowHeadPattern = {
  offset: '50%',
  repeat: 0,
  symbol: L.Symbol.arrowHead({pixelSize: 11, polygon: false, pathOptions: {stroke: true, color: '#16a085'}})
}

export default class MailboxDetailAnalyticsMap extends LeafletMap {
  static propTypes = {
    analytics: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._propKey = 'analytics'
  }

  _isMapDataPresent (props) {
    return props.analytics && props.analytics.whois
  }

  _renderMapComponents (props) {
    const { analytics } = props

    let latLngs = []

    for (var i = 0; i < analytics.whois.length; i++) {
      let rec = analytics.whois[i]
      latLngs.push([rec.latitude, rec.longitude])

      let title = ''
      let subtitle = ''
      let foundOriginSMTPServer = false

      switch (rec.event_order_type) {
        case 1:
          title = 'Origin - Sender'
          break
        case 3:
          if (foundOriginSMTPServer) break
          title = 'Origin - SMTP Server'
          break
        case 100:
        case 101:
          title = 'MsgSafe Received'
          break
        case 103:
          title = 'MsgSafe Released'
          break
      }

      if (title) {
        subtitle = rec.as_org_name
      } else {
        title = rec.as_org_name
      }

      L.marker([rec.latitude, rec.longitude], {icon})
        .addTo(this._map)
        .bindPopup(`${title} <br> ${subtitle}`)

      if (i > 0) {
        const prevRec = analytics.whois[i - 1]
        const arrow = L.polyline([
          [prevRec.latitude, prevRec.longitude],
          [rec.latitude, rec.longitude]
        ], {color: '#1abc9c'}).addTo(this._map)
        L.polylineDecorator(arrow, {patterns: [arrowHeadPattern]}).addTo(this._map)
      }
    }

    var bounds = new L.LatLngBounds(latLngs)
    this._map.fitBounds(bounds, {padding: [10, 10]})
  }
}
