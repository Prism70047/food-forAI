'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import styles from '../../src/styles/page-styles/ProductContent.module.scss'
import Link from 'next/link'

// 移除 mock data, 改為使用 API
export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [reviews, setReviews] = useState([])

  // 取得商品資料
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('商品資料載入失敗')
        }
        const data = await response.json()
        setProduct(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // 處理購物車
  const handleAddToCart = async () => {
    try {
      // 實作購物車邏輯
      console.log('Added to cart:', product.id)
    } catch (err) {
      console.error('加入購物車失敗:', err)
    }
  }

  // 處理收藏
  const handleAddToWishlist = async () => {
    try {
      // 實作收藏邏輯
      console.log('Added to wishlist:', product.id)
    } catch (err) {
      console.error('加入收藏失敗:', err)
    }
  }

  // 載入中狀態
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>載入商品資料中...</p>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新整理</button>
      </div>
    )
  }

  // 找不到商品
  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <p>找不到該商品</p>
        <Link href="/products">返回商品列表</Link>
      </div>
    )
  }

  return (
    <div className={styles.productContainer}>
      {/* 主要商品資訊 */}
      <div className={styles.productWrapper}>
        <img
          src={product.image}
          className={styles.productImage}
          alt={product.title}
        />
        <div className={styles.productInfoContainer}>
          <h1 className={styles.productTitle}>{product.title}</h1>
          <div className={styles.ratingContainer}>
            {/* 評分星星 */}
            <div className={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src="/images/star.png"
                  className={styles.starIcon}
                  alt={`${i + 1} star`}
                />
              ))}
            </div>
            <p className={styles.reviewCount}>{product.reviewCount} 則評價</p>
          </div>
          <div className={styles.productPrice}>
            NT$ {product.price.toLocaleString()}
          </div>
          {/* 操作按鈕 */}
          <div className={styles.actionButtons}>
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              加入購物車
            </button>
            <button
              onClick={handleAddToWishlist}
              className={styles.wishlistButton}
            >
              加入收藏
            </button>
          </div>
        </div>
      </div>

      {/* 商品描述 */}
      <section className={styles.descriptionSection}>
        <h2 className={styles.sectionTitle}>商品介紹</h2>
        <p className={styles.descriptionText}>{product.description}</p>
      </section>

      {/* Recommended Products Section */}
      <div className={styles.recommendedSection}>
        <div className={styles.recommendedTitle}>推薦商品</div>
        <div className={styles.recommendedGrid}>
          {recommendedProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <div className={styles.productCard}>
                <div className={styles.cardImageContainer}>
                  <div className={styles.cardImagePlaceholder}></div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>
                    {product.title}
                    <br />
                    <span className={styles.cardDescription}>
                      {product.description}
                    </span>
                  </div>
                  <div className={styles.cardPrice}>${product.price}</div>
                </div>
                <img
                  src="/images/favorite-outline.png"
                  className={styles.favoriteIcon}
                  alt="Add to favorites"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsTitle}>精選留言</div>
        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <div className={styles.reviewCard} key={review.id}>
              <div className={styles.reviewUser}>
                <div className={styles.userImageContainer}>
                  <img
                    src={review.userImage}
                    className={styles.userImage}
                    alt={review.userName}
                  />
                </div>
                <div className={styles.userInfo}>
                  {/*這裡會放icon*/}
                  <img
                    src="/images/five-stars.png"
                    className={styles.userRating}
                    alt="5 star rating"
                  />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{review.userName}</div>
                    <div className={styles.reviewDate}>{review.date}</div>
                  </div>
                </div>
              </div>
              <div className={styles.reviewContent}>
                <div className={styles.reviewTitle}>{review.title}</div>
                <div className={styles.reviewText}>{review.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
