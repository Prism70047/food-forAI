// RecipeCard.jsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../src/styles/RecipeCard.module.scss' // 使用相對路徑

import { BsBookmarkStarFill, BsBookmarkPlus } from '../icons/icons'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'

import { API_SERVER } from '@/config/api-path'

export default function RecipeCard({
  id,
  image,
  title,
  description,
  initialFavorite = false,
  onFavoriteToggle,
  clickable = true,
  className = '',
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { auth } = useAuth()
  // 2. 在組件內部宣告 router
  const router = useRouter()

  useEffect(() => {
    setIsFavorite(initialFavorite) // 當父組件的收藏狀態改變時，更新本地狀態
  }, [initialFavorite])

  const handleCardClick = () => {
    if (clickable) {
      console.log(`Navigating to recipe ${id}`)
    }
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation() // 防止點擊收藏圖標時觸發卡片點擊

    if (!auth.isAuth) {
      // 如果沒有登入，顯示提示視窗
      setShowLoginModal(true)
      return
    }

    // 如果已登入，執行收藏功能
    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)
    if (onFavoriteToggle) {
      onFavoriteToggle(id)
    }
  }

  return (
    <>
      <div
        className={`${styles.recipeCard} ${className}`}
        onClick={handleCardClick}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        <Link key={id} href={`/recipes/${id}`} passHref>
          <div>
            <img src={image} alt={title} />
          </div>
          <span>
            <h3>{title}</h3>
            <p>{description}</p>
          </span>
        </Link>

        <button
          alt={isFavorite ? '已收藏' : '加入收藏'}
          onClick={handleFavoriteClick}
          style={{ cursor: 'pointer' }}
        >
          {isFavorite ? <BsBookmarkStarFill /> : <BsBookmarkPlus />}
        </button>
      </div>
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        message="需要登入才能收藏食譜喔！"
        onNavigateToLogin={() => {
          setShowLoginModal(false)
          router.push('/login')
        }}
      />
    </>
  )
}
