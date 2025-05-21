'use client'

import { useState, useEffect } from 'react'
import styles from './styles/ForgotPassword.module.scss'
import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
  })
  const [cooldown, setCooldown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 驗證電子郵件格式
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 新增驗證函數
  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          email: '請輸入電子信箱',
        }))
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: '帳號格式錯誤或此帳號尚未註冊',
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          email: '',
        }))
      }
    }
  }

  // 新增倒數計時功能
  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 檢查是否在冷卻時間
    if (cooldown > 0) {
      setError(`請等待 ${cooldown} 秒後再試`)
      return
    }

    // 驗證 email
    if (!email) {
      setErrors({
        email: '請輸入電子信箱',
      })
      return
    }

    if (!validateEmail(email)) {
      setErrors({
        email: '帳號格式錯誤或此帳號尚未註冊',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: 實作實際的密碼重設邏輯 (發送驗證信)
      // 目前僅模擬成功
      setSuccess(true)
      setErrors({ email: '' })
      setCooldown(5) // 設定冷卻時間
    } catch (err) {
      setError('發送重設密碼郵件時發生錯誤，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 修改提交按鈕
  const buttonText = cooldown > 0 ? `重新發送 (${cooldown}s)` : '發送'

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
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

        <h1 className={styles.title}>忘記密碼</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              請填寫註冊時使用的電子信箱
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

          {error && <div className={styles.error}>{error}</div>}
          {success && (
            <div className={styles.success}>
              重設密碼連結已發送到您的信箱，請檢查您的信件並按照指示重設密碼
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || cooldown > 0}
          >
            {buttonText}
          </button>

          <Link href="/login" className={styles.backToLogin}>
            返回登入頁面
          </Link>
        </form>
      </div>
    </div>
  )
}
