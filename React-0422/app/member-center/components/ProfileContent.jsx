'use client'

import React, { useEffect } from 'react'
import styles from '../styles/member-center.module.scss'
import useSWR from 'swr'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'

const ProfileContent = () => {
  const { auth, getAuthHeader, authInit } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔎 authInit:', authInit)
    console.log('🔎 auth:', auth)
    if (authInit) {
      if (auth?.id) {
        console.log('✅ 用戶登入:', auth.id)
      } else {
        console.warn('⛔️ 用戶未登入，auth 內容:', auth)
      }
    } else {
      console.log('⌛ 等待 auth 初始化中...')
    }

    if (authInit && !auth?.id) {
      router.push('/login')
    }
  }, [authInit, auth])

  const fetcher = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '無法取得資料')
      }

      return data
    } catch (error) {
      console.error('API 錯誤:', error)
      throw error
    }
  }

  const shouldFetch = authInit && auth?.id
  const { data, error } = useSWR(
    shouldFetch
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/api/${auth.id}`
      : null,
    fetcher
  )

  if (!authInit) return <div className={styles.loading}>登入狀態確認中...</div>
  if (error)
    return <div className={styles.error}>讀取資料失敗: {error.message}</div>
  if (!data) return <div className={styles.loading}>讀取中...</div>
  if (!data.success || !data.rows)
    return <div className={styles.error}>資料格式錯誤</div>

  const user = data.rows

  const profileFields = [
    { label: '電子信箱', value: user.email },
    { label: '手機號碼', value: user.phone_number },
    { label: '姓名', value: user.full_name },
    { label: '使用者名稱', value: user.username },
    { label: '生日', value: user.birthday },
    { label: '性別', value: user.gender },
    { label: '地址', value: user.address },
  ]

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.userPhoto}>
          <img
            src={
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
            <div className={styles.detailContent}>
              {field.value || '尚未填寫'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileContent
