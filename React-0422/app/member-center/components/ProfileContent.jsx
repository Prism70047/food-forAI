'use client'

import React, { useEffect } from 'react'
import styles from '../styles/member-center.module.scss'
import useSWR from 'swr'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'

const ProfileContent = () => {
  const { auth, getAuthHeader, authInit } = useAuth()
  const router = useRouter()

  // --- 偵錯用 ---
  useEffect(() => {
    console.log('[ProfileContent] Auth State:', auth)
    console.log('[ProfileContent] Auth Init:', authInit)
    console.log('[ProfileContent] User ID for fetch:', auth?.user_id)
  }, [auth, authInit])
  // --- 偵錯用結束 ---

  useEffect(() => {
    // 確認 Auth context 初始化完成，若未登入則導向登入頁
    if (authInit && !auth?.user_id) {
      router.push('/login')
    }
  }, [authInit, auth, router])

  // 抓取資料的函數 (fetcher)
  const fetcher = async (url) => {
    try {
      // 除錯用
      console.log('Fetching URL:', url)
      console.log('Auth headers:', getAuthHeader())

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(), // 帶上 JWT token
        },
      })

      // 檢查回應狀態
      console.log('Response status:', response.status)
      // 檢查回應內容類型
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)

      if (!response.ok) {
        const text = await response.text()
        console.error('Error response body:', text)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('Response data:', data)

      if (!data.success) {
        throw new Error(data.error || '無法取得資料')
      }

      return data
    } catch (error) {
      console.error('抓取會員資料 API 錯誤:', error)
      throw error // 拋出錯誤以便 SWR 捕捉
    }
  }

  // 確保 auth.user_id 存在才發送 API 請求
  const shouldFetch = authInit && auth?.token // 用 token 判斷
  const { data, error: swrError } = useSWR(
    // 從環境變數讀取後端 API 的 URL，並帶上 user_id
    shouldFetch
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/api/${auth.user_id}`
      : null,
    fetcher // 使用上面定義的 fetcher
  )

  // 錯誤狀態處理
  if (!authInit) return <div className={styles.loading}>登入狀態確認中...</div>
  if (swrError)
    return (
      <div className={styles.error}>會員資料讀取失敗：{swrError.message}</div>
    )
  if (!data && shouldFetch)
    // 在應該 fetch 且 data 尚未載入時
    return <div className={styles.loading}>會員資料讀取中...</div>
  if (!data?.success || !data?.rows) {
    // 檢查後端回傳的資料結構是否如預期
    if (shouldFetch) {
      return <div className={styles.error}>會員資料格式錯誤或未找到</div>
    }
    return null // 如果不預期有資料 (例如尚未登入完成)，則不顯示任何內容
  }

  const user = data.rows // 從 API 回應中取得會員資料

  // 定義要呈現的會員資料欄位
  const profileFields = [
    { label: '電子信箱', value: user.email },
    { label: '手機號碼', value: user.phone_number || '未填寫' },
    { label: '姓名', value: user.full_name || '未填寫' },
    { label: '使用者名稱', value: user.username || '未填寫' },
    { label: '生日', value: user.birthday || '未填寫' },
    {
      label: '性別',
      value:
        user.gender === 'M'
          ? '男'
          : user.gender === 'F'
            ? '女'
            : user.gender === 'Other'
              ? '其他'
              : '不提供',
    },
    { label: '地址', value: user.address || '未填寫' },
  ]

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.userPhoto}>
          <img
            src={
              // TODO: 資料表 users 增加 avatar 圖片欄位 (user.avatar)，並提供上傳功能
              // 若無上傳則使用預設圖片
              user.avatar ||
              'https://cdn.builder.io/api/v1/image/assets/TEMP/f52afbad8d5e8417cf84bbdcbf5840a0d135146c?placeholderIfAbsent=true&apiKey=137a18afd6bf49c9985266999785670f'
            }
            alt="User profile"
          />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.profileText}>
            <div className={styles.username}>{user.username}</div>
            <div className={styles.email}>{user.email}</div>
          </div>
          <div className={styles.profileButtons}>
            <button className={styles.editButton}>修改頭貼</button>
            <button className={styles.editButton}>編輯會員資料</button>
          </div>
        </div>
      </div>

      <div className={styles.profileDetails}>
        {profileFields.map((field, index) => (
          <div key={index} className={styles.detailRow}>
            <div className={styles.detailTitle}>{field.label}</div>
            <div className={styles.detailContent}>{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileContent
