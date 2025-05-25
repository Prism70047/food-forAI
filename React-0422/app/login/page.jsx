'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'
import styles from './styles/Login.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from '../icons/icons'

export default function LoginPage() {
  const { login, auth } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    submit: '', // 當提交時出現錯誤的狀態
  })

  // 驗證電子郵件格式
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 欄位失焦時進行驗證
  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!value) {
        error = '請輸入電子信箱'
      } else if (!validateEmail(value)) {
        error = '帳號格式錯誤或此帳號尚未註冊'
      }
    }
    if (name === 'password') {
      if (!value) {
        error = '請輸入密碼'
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({ email: '', password: '', submit: '' }) // 重置所有錯誤訊息

    let hasError = false
    let newErrors = {
      email: '',
      password: '',
      submit: '',
    }

    // 同時檢查 email 和密碼
    if (!email) {
      newErrors.email = '請輸入電子信箱'
      hasError = true
    } else if (!validateEmail(email)) {
      newErrors.email = '帳號格式錯誤或此帳號尚未註冊'
      hasError = true
    }

    if (!password) {
      newErrors.password = '請輸入密碼'
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/member-center')
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: '帳號或密碼錯誤，請重新輸入',
        }))
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: '登入時發生問題，請稍後再試',
      }))
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.logoContainer}>
          <Image
            src="/images/logo/logo-onlyFont-02.svg"
            alt="Logo"
            width={45}
            height={68}
            style={{ width: 'auto', height: '100%' }}
            priority
          />
        </div>

        <h1 className={styles.title}>會員登入</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* 帳號輸入框 */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              帳號 (電子信箱)
            </label>
            <input
              type="text"
              id="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField('email', e.target.value)}
            />
            {errors.email && (
              <div className={styles.errorMessage}>{errors.email}</div>
            )}
          </div>

          {/* 密碼輸入框 */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              密碼
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                maxLength="20"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="*************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => validateField('password', e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.password && (
              <div className={styles.errorMessage}>{errors.password}</div>
            )}
          </div>

          <Link href="/forgot-password" className={styles.forgotPassword}>
            忘記密碼
          </Link>

          <button type="submit" className={styles.loginButton}>
            登入
          </button>

          {/* 提交後的錯誤訊息 */}
          {errors.submit && (
            <div className={`${styles.errorMessageSubmit}`}>
              {errors.submit}
            </div>
          )}
        </form>

        {/* 其他帳號登入 */}
        <div className={styles.divider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>以其他帳號登入</span>
          <span className={styles.dividerLine}></span>
        </div>

        {/* TODO: 第三方登入API */}
        <div className={styles.socialButtons}>
          <button className={styles.socialButton}>
            <FaGoogle />
            <span>Google</span>
          </button>
          <button className={styles.socialButton}>
            <FaFacebook />
            <span>Facebook</span>
          </button>
        </div>

        <div className={styles.register}>
          <span>還沒有任何帳號?</span>
          <Link href="/register" className={styles.registerLink}>
            立即註冊
          </Link>
        </div>
      </div>
    </div>
  )
}
