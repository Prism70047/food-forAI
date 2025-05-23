'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import styles from '../../styles/RestaurantDetail.module.css'
import useSWR from 'swr'
import { useEffect } from 'react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { API_SERVER } from '@/config/api-path'
import { IoStar } from 'react-icons/io5'
import { IoMdShare } from 'react-icons/io'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { FaPhoneAlt } from 'react-icons/fa'
import { FaRegClock } from 'react-icons/fa6'
import { Modal, Button } from 'react-bootstrap'
import Bread from '@/app/components/Bread'
// import MapComponent from '../app/restaurants/components/MapComponent.jsx'
import MapComponent from '../components/MapComponent.jsx'
import BackgroundColorChanger from '@/app/use-effect/page'

// Mock data for restaurant details

export default function RestaurantDetailPage() {
  // 在 App Router 中使用 useParams 獲取路由參數
  const params = useParams()
  const id = params.id // 獲取動態路由參數
  // 動態引入 Leaflet 相關組件，避免 SSR 問題
  const MapComponent = dynamic(() => import('../components/MapComponent'), {
    ssr: false,
    loading: () => <p>載入地圖中...</p>,
  })
  // 地圖開啟與否
  const [showMap, setShowMap] = useState(false)

  // 如果需要獲取查詢參數，使用 useSearchParams
  const searchParams = useSearchParams()

  // 為確保客戶端渲染時能正確載入數據，添加一個加載狀態
  const [isLoading, setIsLoading] = useState(true)

  // 使用 useEffect 確保客戶端渲染
  useEffect(() => {
    if (id) {
      setIsLoading(false)
    }
  }, [id])
  const fetcher = (url) => fetch(url).then((res) => res.json())

  // 使用 useSWR 來抓取資料，確保有 id 時才發送請求
  const { data, error } = useSWR(
    id ? `${API_SERVER}/restaurants/api/${id}` : null,
    fetcher
  )

  // 如果還在加載中，顯示加載狀態
  if (isLoading) return <div>頁面加載中...</div>

  // 如果沒有 ID，顯示錯誤信息
  if (!id) return <div>錯誤: 找不到餐廳ID</div>

  // 當數據還在加載時
  if (!data && !error) return <div>正在加載餐廳數據...</div>

  // 錯誤處理
  if (error) return <div>Error: {error.message}</div>

  // 獲取數據
  const restaurant = data?.data || []

  // const restaurant = getRestaurantData(id)
  // 處理彈出視窗的開關
  const handleClose = () => setShowMap(false)
  const handleShow = () => setShowMap(true)

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div className={styles.container}>
        {/* 測試一下有沒有拿到JSON資料。如果有拿掉的話可以先註解掉 */}
        {/* <div>{JSON.stringify(restaurant)}</div> */}
        <Bread
          style={{ BackgroundColor: 'red' }}
          items={[
            { text: '首頁', href: '/' },
            { text: '餐廳列表', href: '/restaurants' },
            { text: '餐廳介紹' },
          ]}
        />
        <div className={styles.content}>
          <div className={styles.breadcrumb}>
            <div className={styles.mainContent}>
              <h1 className={styles.restaurantTitle}>
                隱身巷弄的美味秘境：{restaurant.name}
              </h1>

              <div className={styles.actionButtons}>
                <div className={styles.actionButton}>
                  <img
                    src="/images/like/love1.png"
                    className={styles.actionIcon}
                    alt="收藏"
                  />
                  <div>收藏餐廳</div>
                </div>
                <div className={styles.actionButton}>
                  {/* <img
                  src="/images/restaurant/share-icon.png"
                  className={styles.actionIcon}
                  alt="分享"
                /> */}
                  <IoMdShare />
                  <div>分享</div>
                </div>
              </div>

              <div className={styles.authorInfo}>
                <div className={styles.recommendBadge}>
                  {/* <img
                  src="/images/restaurant/recommend-icon.png"
                  className={styles.badgeIcon}
                  alt="特別推薦"
                /> */}
                  <IoStar />
                  <div className={styles.badgeText}>特別推薦</div>
                </div>
                <img
                  src="/images/user/default.jpg"
                  className={styles.authorAvatar}
                  alt="作者頭像"
                />
                <div className={styles.authorLabel}>
                  {restaurant.author}美食編輯
                </div>
                <div className={styles.publishDate}>
                  {restaurant.publishDate}2024.01.15
                </div>
              </div>

              <div className={styles.heroImage}>
                <img
                  src={restaurant.image}
                  className={styles.heroImg}
                  alt={restaurant.title}
                />
              </div>

              <div className={styles.restaurantDescription}>
                <div className={styles.descriptionText}>
                  {restaurant.description}
                </div>

                <h2 className={styles.sectionTitle}>特色料理品味之旅</h2>

                <div className={styles.quoteBox}>
                  <div className={styles.quoteText}>
                    「每一道料理，都是一場味蕾的藝術饗宴。在這裡，我們不僅提供美食，更創造難忘的餐飲體驗。」
                  </div>
                  <div className={styles.quoteAuthor}>— Marco Rossi 主廚</div>
                </div>

                {restaurant.dishes.map((dish, index) => (
                  <div className={styles.dishContainer} key={index}>
                    <img
                      src={dish.image_url}
                      className={styles.dishImage}
                      alt={dish.title}
                    />
                    <h3 className={styles.dishTitle}>{dish.title}</h3>
                    <div className={styles.dishDescription}>
                      {dish.description}
                    </div>
                  </div>
                ))}

                <div className={styles.recommendationBox}>
                  <div className={styles.recommendationTitle}>主廚推薦搭配</div>
                  <div className={styles.recommendationText}>
                    建議可以選擇餐廳特別引進的托斯卡尼基安地紅酒，其果香與單寧的平衡，能夠完美襯托出主菜的風味。餐後甜點則可以搭配西西里島的甜酒，其中蘊含的堅果與蜂蜜香氣，為美食之旅帶來圓滿的結束。
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardTitle}>餐廳資訊</div>
                  <div className={styles.infoCardContent}>
                    <div className={styles.infoItem}>
                      {/* <img
                      src="/images/restaurant/location-icon.png"
                      className={styles.infoIcon}
                      alt="地址"
                    /> */}

                      <FaMapMarkerAlt />
                      <div className={styles.infoTextGroup}>
                        <div className={styles.infoText}>
                          {restaurant.address}
                        </div>
                        <div
                          className={styles.infoLink}
                          onClick={handleShow}
                          style={{ cursor: 'pointer' }}
                        >
                          在地圖開啟
                        </div>
                        {/* 新增 Modal 組件 */}
                        <Modal show={showMap} onHide={handleClose} size="lg">
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {restaurant.name} - 位置資訊
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            {restaurant.latitude && restaurant.longitude ? (
                              <div style={{ height: '400px', width: '100%' }}>
                                <MapComponent
                                  address={restaurant.address}
                                  latitude={parseFloat(restaurant.latitude)}
                                  longitude={parseFloat(restaurant.longitude)}
                                  name={restaurant.name}
                                />
                              </div>
                            ) : (
                              <div className={styles.noMapData}>
                                地圖資料載入中...
                              </div>
                            )}
                          </Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                              關閉
                            </Button>
                            <Button
                              variant="primary"
                              as="a"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              在 Google Maps 開啟
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoItemSimple}>
                    {/* <img
                      src="/images/restaurant/phone-icon.png"
                      className={styles.infoIcon}
                      alt="電話"
                    /> */}
                    <FaPhoneAlt />

                    <div>{restaurant.phone}</div>
                  </div>

                  <div className={styles.infoItemHours}>
                    {/* <img
                      src="/images/restaurant/time-icon.png"
                      className={styles.infoIconSmall}
                      alt="營業時間"
                    /> */}
                    <FaRegClock />

                    <div className={styles.infoTextFull}>
                      {restaurant.hours}
                    </div>
                  </div>
                  <div className={styles.infoSubtitle}>消費資訊</div>
                  <div className={styles.infoList}>
                    {/* 假設 consumption 現在在 restaurant 的第一層 */}
                    <div className={styles.infoListItem}>
                      ・
                      {restaurant.min_spend
                        ? `最低消費: ${restaurant.min_spend}元`
                        : '無最低消費'}
                    </div>
                    <div className={styles.infoListItem}>
                      ・
                      {restaurant.service_charge
                        ? `服務費: ${restaurant.service_charge}%`
                        : '無服務費'}
                    </div>
                    <div className={styles.infoListItem}>
                      ・
                      {restaurant.payment_info
                        ? `付款方式: ${restaurant.payment_info}`
                        : '付款資訊未提供'}
                    </div>
                    {/* {restaurant.info.consumption.map((item, index) => (
                    <div key={index} className={styles.infoListItem}>
                      ・{item}
                    </div>
                  ))} */}
                  </div>
                </div>
                {/* 資料庫忘了寫相關餐廳的資訊。所以下面這個先關掉(註解掉) */}
                <div className={styles.infoCard}>
                  <div className={styles.infoCardTitle}>相關餐廳</div>
                  <div className={styles.relatedRestaurants}>
                    {restaurant.related_restaurants.map((related, index) => (
                      <div
                        key={index}
                        className={
                          index === 2
                            ? styles.relatedItemWide
                            : styles.relatedItem
                        }
                      >
                        <Link
                          href={`/restaurants/${related.related_restaurant_id}`}
                        >
                          <img
                            src={related.image}
                            className={styles.relatedImage}
                            alt={related.name}
                          />
                          <div
                            className={
                              index === 2
                                ? styles.relatedInfoWide
                                : styles.relatedInfo
                            }
                          >
                            <div
                              className={
                                index === 2
                                  ? styles.relatedNameWide
                                  : styles.relatedName
                              }
                            >
                              {related.related_restaurant_name}
                            </div>
                            <div className={styles.relatedLocation}>
                              {related.location}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
