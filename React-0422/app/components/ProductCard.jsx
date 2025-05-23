'use client'

import React, { useState } from 'react'
import styles from '../src/styles/ShopList.module.scss'
import { MdFavorite, MdFavoriteBorder } from '../icons/icons'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/auth-context' //  引入你的 Auth hook

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
  const router = useRouter()
  const { auth } = useAuth() //  使用 auth context 拿 user.id

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()

    if (!auth?.id) {
      alert('請先登入才能收藏商品')
      return
    }

    const baseUrl = 'http://localhost:3001'
    const endpoint = isFavorite
      ? `${baseUrl}/api/products/unfavorite`
      : `${baseUrl}/api/products/favorite`

    const method = isFavorite ? 'DELETE' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: auth.id, // ✅ 使用登入者 ID
          product_id: id,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('API 錯誤:', errorData)
        return
      }

      setIsFavorite(!isFavorite)
      if (onFavoriteToggle) {
        onFavoriteToggle(id, !isFavorite)
      }
    } catch (error) {
      console.error('fetch 錯誤:', error)
    }
  }

  const handleCardClick = () => {
    if (clickable) {
      router.push(`/products/${id}`)
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
        className={`${styles.wishlistButton} ${isFavorite ? styles.active : ''}`}
      >
        {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
    </div>
  )
}

export default ProductCard
