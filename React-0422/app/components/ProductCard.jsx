'use client'

import React, { useState } from 'react'
import styles from '../src/styles/ShopList.module.scss'
import { MdFavorite, MdFavoriteBorder } from '../icons/icons'
import { useRouter } from 'next/navigation' // ✅ 引入 useRouter

export const ProductCard = ({
  id = 0,
  name = 'Product Name',
  image = '/placeholder.jpg',
  brand = '',
  price = '',
  original_price = '',
  clickable = true,
  initialFavorite = false,
  onFavoriteToggle,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const router = useRouter() //  初始化 Router

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    if (onFavoriteToggle) {
      onFavoriteToggle(id, !isFavorite)
    }
  }

  const handleCardClick = () => {
    if (clickable) {
      router.push(`/products/${id}`) //  改用 router.push
    }
  }

  return (
    <div
      className={styles.shopCard}
      onClick={handleCardClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className={styles.shopCardImg}>
        <img src={image} alt={name} />
      </div>
      <span>
        <div>
          <p>{brand}</p>
          <h3>{name}</h3>
        </div>
        <div>
          <p>${original_price}</p>
          <h2>${price}</h2>
        </div>
      </span>
      <button
        alt={isFavorite ? '已收藏' : '加入收藏'}
        onClick={handleFavoriteClick}
        style={{ cursor: 'pointer' }}
      >
        {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
    </div>
  )
}

export default ProductCard
