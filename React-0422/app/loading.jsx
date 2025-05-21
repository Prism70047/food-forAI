// app/dashboard/loading.jsx
'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Loading() {
  //   const [show, setShow] = useState(true)

  //   useEffect(() => {
  //     // 設定 2 秒後才隱藏載入畫面
  //     const timer = setTimeout(() => {
  //       setShow(false)
  //     }, 8000)

  //     return () => clearTimeout(timer)
  //   }, [])

  //   if (!show) return null

  // 這裡放置您的讀取 UI，例如文字或 Spinner
  return (
    // <div
    //   style={{
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     height: '100vh', // 讓它佔滿 Layout 空間
    //     fontSize: '24px',
    //   }}
    // >
    //   <p>儀表板正在載入中...</p>
    /* 您可以在這裡加入 CSS 類名來應用更複雜的動畫 */
    /* <div className="loading-spinner"></div> */
    // </div>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>載入中...</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
