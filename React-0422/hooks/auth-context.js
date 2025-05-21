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
  id: 0,
  email: '',
  // nickname: '',
  username: '',
  token: '',
}

const storageKey = 'shinder-auth'

// 元件
export function AuthContextProvider({ children }) {
  const [auth, setAuth] = useState({ ...noAuth })
  const [authInit, setAuthInit] = useState(false)

  // 登入的功能寫成函式
  const login = async (email = '', password = '') => {
    const r = await fetch(JWT_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const result = await r.json()

    // 調試輸出後端返回的數據
    console.log('後端返回的數據:', result)

    if (result.success) {
      // 把登入的狀態記錄起來
      localStorage.setItem(storageKey, JSON.stringify(result.data))
      setAuth({ ...result.data }) // 變更登入的狀態
      return true
    }
    return false
  }
  const logout = () => {
    localStorage.removeItem(storageKey)
    setAuth({ ...noAuth })
  }
  const getAuthHeader = () => {
    if (!auth.token) return {}
    return {
      Authorization: `Bearer ${auth.token}`,
    }
  }

  useEffect(() => {
    // 刷新頁面時, 從 localStorage 讀取登入的狀態資料
    const str = localStorage.getItem(storageKey)
    if (str) {
      try {
        const authData = JSON.parse(str)
        setAuth(authData)
      } catch (ex) {
        console.log(ex)
      }
    }
    setAuthInit(true) // 做完初始化
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
