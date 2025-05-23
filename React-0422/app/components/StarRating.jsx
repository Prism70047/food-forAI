import React from 'react'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { AiOutlineStar } from 'react-icons/ai'

const StarRating = ({ rating }) => {
  const stars = []
  const totalStars = 5

  for (let i = 0; i < totalStars; i++) {
    if (rating >= i + 1) {
      // 整星
      stars.push(<FaStar key={i} className="star star-filled" />)
    } else if (rating >= i + 0.5) {
      // 半星
      stars.push(<FaStarHalfAlt key={i} className="star star-half" />)
    } else {
      // 空星
      stars.push(<AiOutlineStar key={i} className="star star-empty" />)
    }
  }

  return <div className="star-rating">{stars}</div>
}

export default StarRating
