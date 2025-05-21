'use client'

import React, { useState, useEffect } from 'react' // 引入 useState
import styles from './styles/member-center.module.scss'
import Sidebar from './components/Sidebar'
import ProfileContent from './components/ProfileContent'
import PasswordContent from './components/PasswordContent';
// import FavoritesContent from './components/FavoritesContent';
// import OrdersContent from './components/OrdersContent';
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'

export default function MemberCenter() {
  const { auth } = useAuth()
  const router = useRouter()

  // useState Hook 來管理目前要顯示的內容，預設顯示 'profile'
  const [activeContent, setActiveContent] = useState('profile') // <--- 新增這一行

  useEffect(() => {
    // 如果沒有登入，導向到登入頁面
    if (!auth) {
      router.push('/login')
    }
  }, [auth, router])

  // 如果還在載入中或尚未登入
  if (!auth) {
    return <div>Loading...</div> // 或者更友善的載入提示
  }

  // 函數用來根據 activeContent 的值渲染對應的元件
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

  // 如果已經登入，顯示會員中心的內容
  return (
    <>
      <div className={styles.pageContent}>
        {/* 將 activeContent 和 setActiveContent 傳遞給 Sidebar */}
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
        />
        {/* 呼叫 renderContent 來顯示對應的內容 */}
        <div className={styles.contentArea}>
          {' '}
          {/* 建議為右側內容區域加上一個 class，方便管理樣式 */}
          {renderContent()}
        </div>
      </div>
    </>
  )
}
