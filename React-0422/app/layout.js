'use client'
import { useEffect, useState } from 'react'
// 伺服器端元件很多Hook不能用，所以這個檔案才沒有指定成客戶端元件
// context套用第3步: 最上(外)層元件包裹提供者元件，讓祖先元件可以提供它
// 建立P(Provider)到C(Consumer)的階段結構
import Providers from './providers'
import Header from './components/Header'
import Footer from './components/Footer'
import './styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Script from 'next/script'
import './src/styles/main.scss' // 全域樣式
// 這邊要先註解，不然會報錯誤
// import './builder/builder-register'
// 05/18測試網頁進場動畫，
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

import Loading from './loading'

// 因為這段程式碼會在伺服器端執行，所以不能使用 usePathname
// 也就是因為這段會擋到網頁轉場動畫，所以先註解調一下
// export const metadata = {
//   title: '美味食譜 - 您的烹飪好夥伴',
//   description: '探索美味食譜、購買優質食材，讓烹飪變得更簡單',
// }

export default function RootLayout({ children }) {
  const pathname = usePathname() // 取得當前路由路徑
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // 這裡的 2000 毫秒是為了讓動畫更明顯，實際上可以根據需要調整

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <html lang="zh-TW">
      <body>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"></Script>
        <Providers>
          <Header />
          {/*  
          加入 Loading 組件
          {isLoading && <Loading />}
          {/* AnimatePresence 包圍會隨 key 變化的 motion 元件 
          <AnimatePresence mode="wait" initial={false}>
            {/*
              motion.main 將動畫應用到 <main> 標籤本身
              key={pathname} 告訴 AnimatePresence 這個元素代表的「頁面」變了
              initial, animate, exit 定義動畫的開始、結束、退出狀態
            
            <motion.main
              key={pathname} // 必須將 pathname 作為 key
              initial="initial"
              animate={isLoading ? 'initial' : 'animate'}
              exit="exit"
              variants={{
                initial: { opacity: 0, y: 20 }, //初始狀態：透明且稍微向下偏移
                animate: { opacity: 1, y: 0 }, // 動畫結束狀態：完全不透明且回到正常位置
                exit: { opacity: 0, y: -20 }, // 退出狀態：變透明且稍微向下偏移
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                // duration: 0.3,
              }} // 動畫持續 0.3 秒
              style={{ width: '100%', position: 'relative' }} // 確保 main 佔滿寬度，避免佈局問題
            >*/}
          <main>
            {children} {/* 這裡會渲染當前路由對應的 page.jsx 內容 */}
          </main>
          {/* </motion.main>
          </AnimatePresence> */}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
