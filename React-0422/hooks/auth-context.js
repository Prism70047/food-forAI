'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { JWT_LOGIN } from '@/config/api-path'

const AuthContext = createContext()
AuthContext.displayName = 'MyAuthContext'

/*
1. 登入
2. 登出
3. 保有登入的狀態 (取得登入者的資訊)
4. 要有取得 Authorization 檔頭的函式
*/

const noAuth = {
  token: '',
  user_id: 0,
  email: '',
  username: '',
  full_name: '',
  phone_number: '',
  birthday: '',
  gender: '',
  address: '',
}

const storageKey = 'shinder-auth'

// 元件
export function AuthContextProvider({ children }) {
  const [auth, setAuth] = useState({ ...noAuth })
  const [authInit, setAuthInit] = useState(false) // 初始化狀態

  // 登入功能函式
  const login = async (email = '', password = '') => {
    try {
      const r = await fetch(JWT_LOGIN, {
        // 使用自定義的 JWT_LOGIN 路徑
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await r.json()
      if (result.success && result.data && result.data.token) {
        localStorage.setItem(storageKey, JSON.stringify(result.data))
        setAuth({ ...result.data }) // 直接使用後端回傳的 data
        return true
      } else {
        // 登入失敗，可以根據 result.code 設定具體的錯誤訊息
        console.error('登入失敗:', result.message || result.error || '未知錯誤')
        setAuth({ ...noAuth }) // 清除可能殘留的 auth 狀態
        return false
      }
    } catch (error) {
      console.error('登入請求 API 錯誤:', error)
      setAuth({ ...noAuth })
      return false
    }
  }

  // 登出功能函式
  // 清除 localStorage 中的 auth 資料
  const logout = () => {
    localStorage.removeItem(storageKey)
    setAuth({ ...noAuth })
  }

  // 取得 Authorization 檔頭
  const getAuthHeader = () => {
    if (auth?.token) {
      return {
        Authorization: `Bearer ${auth.token}`,
      }
    }
    return {}
  }

  useEffect(() => {
    // 刷新頁面時, 從 localStorage 讀取登入的狀態資料
    const str = localStorage.getItem(storageKey)
    if (str) {
      try {
        const storedAuthData = JSON.parse(str)
        // 確保從 localStorage 讀取的資料包含必要的 token 和 user_id
        if (storedAuthData && storedAuthData.token && storedAuthData.user_id) {
          // 驗證 token 是否存在
          setAuth(storedAuthData)
        } else {
          // 如果 localStorage 中的資料不完整或無 token，則清除它
          localStorage.removeItem(storageKey)
        }
      } catch (ex) {
        console.error('從 localStorage 解析 auth 資料失敗:', ex)
        localStorage.removeItem(storageKey) // 解析失敗也清除
      }
    }
    setAuthInit(true) // 標記初始化完成
  }, [])

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, getAuthHeader, authInit }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
