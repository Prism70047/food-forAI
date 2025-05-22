// member-center/page.jsx
'use client'

import React, { useState, useEffect } from 'react' // 引入 useState
import styles from './styles/member-center.module.scss'
import Sidebar from './components/Sidebar'
import ProfileContent from './components/ProfileContent'
import PasswordContent from './components/PasswordContent'
// import FavoritesContent from './components/FavoritesContent';
// import OrdersContent from './components/OrdersContent';
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'

export default function MemberCenter() {
  const { auth, authInit } = useAuth() // 從 context 取得 auth 和 authInit 狀態
  const router = useRouter()

  // useState Hook 來管理目前要顯示的內容，預設顯示 'profile'
  const [activeContent, setActiveContent] = useState('profile')

  useEffect(() => {
    // 等待 auth 初始化完成後才進行檢查
    if (authInit) {
      if (!auth.user_id) {
        // 檢查 auth.user_id 是否存在或為有效值 (例如不為 0 或 null)
        router.push('/login') // 如果未登入，導向到登入頁
      }
    }
  }, [auth, authInit, router])

  // 如果 authInit 為 false，表示還在從 localStorage 讀取登入狀態
  // 或者 auth.user_id 不存在 (未登入)
  if (!authInit || !auth.user_id) {
    return (
      <div className={styles.pageContent}>
        <p className={styles.detailContent}>跳轉至登入頁面...</p>
      </div>
    )
  }

  // 根據 activeContent 的值渲染對應的元件
  const renderContent = () => {
    switch (activeContent) {
      case 'profile':
        return <ProfileContent />
      case 'password':
        return <PasswordContent />
      case 'favorites':
        return <FavoritesContent />
      case 'orders':
        return <OrdersContent />
      default:
        return <ProfileContent /> // 預設或錯誤情況下顯示個人資料
    }
  }

  return (
    <>
      <div className={styles.pageContent}>
        {/* 將 activeContent 和 setActiveContent 傳遞給 Sidebar */}
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
        />
        {/* 呼叫 renderContent 來顯示對應的內容 */}
        <div className={styles.contentArea}>{renderContent()}</div>
      </div>
    </>
  )
}
