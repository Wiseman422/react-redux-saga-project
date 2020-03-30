import React from 'react'
import PropTypes from 'prop-types'

const ContentEmphasisBlock = p => (
  <div className='benefits__emphasis_block'>
    <div className='benefits__emphasis_content'>
      <p>{p.content}</p>
    </div>
  </div>
)

ContentEmphasisBlock.propTypes = {
  content: PropTypes.string
}

export default ContentEmphasisBlock
