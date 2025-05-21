'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './styles/Register.module.scss'
import Image from 'next/image'
import { FaEye, FaEyeSlash, FaCalendarAlt, FaChevronDown } from '../icons/icons'

// TODO: 註冊API，後端新增register.js檔案
// 註冊成功後將會員資料寫入已經建立好的資料表儲存
// 資料庫名稱：food
// 資料表名稱：users
// 資料表欄位：電子信箱email、手機號碼phone_number、密碼password_hash、姓名full_name、使用者名稱username、生日birthday、性別gender、地址address
// 密碼儲存於資料庫需使用bcrypt雜湊加密
export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    birthday: '',
    gender: '',
    address: '',
  })

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  })

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    birthday: '',
  })

  // 驗證電子郵件格式
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 驗證手機號碼格式
  const validatePhone = (phone) => {
    const phoneRegex = /^09\d{8}$/
    return phoneRegex.test(phone)
  }

  // 驗證密碼格式
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
    return passwordRegex.test(password)
  }

  // 驗證生日格式和年齡
  const validateBirthday = (birthday) => {
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!birthdayRegex.test(birthday)) return false

    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age >= 18
  }

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'email':
        if (!value) {
          error = '請輸入電子信箱'
        } else if (!validateEmail(value)) {
          error = '請輸入有效的電子信箱格式'
        }
        break

      case 'phone':
        if (!value) {
          error = '請輸入手機號碼'
        } else if (!validatePhone(value)) {
          error = '請輸入有效的手機號碼格式'
        }
        break

      case 'password':
        if (!value) {
          error = '請輸入密碼'
        } else if (!validatePassword(value)) {
          error = '密碼需包含大小寫英文字母及數字，長度8-20碼'
        }
        break

      case 'confirmPassword':
        if (!value) {
          error = '請再次輸入密碼'
        } else if (value !== formData.password) {
          error = '密碼不一致'
        }
        break

      case 'name':
        if (!value) {
          error = '請輸入姓名'
        }
        break

      case 'username':
        if (!value) {
          error = '請輸入使用者名稱'
        } else if (value.length > 10) {
          error = '使用者名稱不可超過10個字'
        }
        break

      case 'birthday':
        if (!value) {
          error = '請輸入生日'
        } else if (!validateBirthday(value)) {
          error = '需年滿18歲才能註冊'
        }
        break
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    return !error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 驗證所有必填欄位
    const requiredFields = [
      'email',
      'phone',
      'password',
      'confirmPassword',
      'name',
      'username',
      'birthday',
    ]
    let isValid = true

    // 清空所有錯誤訊息
    setErrors({})

    requiredFields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })

    if (!isValid) return

    try {
      // TODO: 實作註冊 API 呼叫
      // const response = await register(formData)
      router.push('/login')
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: '註冊失敗，請稍後再試',
      }))
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerForm}>
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

        <h1 className={styles.title}>會員註冊</h1>
        <p className={styles.requiredField}>「*」為必填欄位</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              電子信箱 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
              placeholder="Example123@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField('email', e.target.value)}
            />
            {errors.email && (
              <div className={styles.errorMessage}>{errors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              手機號碼 *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`${styles.input} ${errors.phone ? styles.errorInput : ''}`}
              placeholder="開頭必須為09，總共10碼數字"
              value={formData.phone}
              onChange={handleChange}
              onBlur={(e) => validateField('phone', e.target.value)}
            />
            {errors.phone && (
              <div className={styles.errorMessage}>{errors.phone}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              密碼 *
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword.password ? 'text' : 'password'}
                id="password"
                name="password"
                className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                placeholder="需包含大小寫英文字母及數字，長度8-20碼"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => validateField('password', e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    password: !prev.password,
                  }))
                }
              >
                {showPassword.password ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.password && (
              <div className={styles.errorMessage}>{errors.password}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              確認密碼 *
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword.confirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                placeholder="再次輸入密碼"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword,
                  }))
                }
              >
                {showPassword.confirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className={styles.errorMessage}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              姓名 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`${styles.input} ${errors.name ? styles.errorInput : ''}`}
              placeholder="請填寫完整姓名"
              value={formData.name}
              onChange={handleChange}
              onBlur={(e) => validateField('name', e.target.value)}
            />
            {errors.name && (
              <div className={styles.errorMessage}>{errors.name}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              使用者名稱 *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`${styles.input} ${errors.username ? styles.errorInput : ''}`}
              placeholder="10個字以內，名稱會顯示於留言上"
              value={formData.username}
              onChange={handleChange}
              onBlur={(e) => validateField('username', e.target.value)}
            />
            {errors.username && (
              <div className={styles.errorMessage}>{errors.username}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthday" className={styles.label}>
              生日 *
            </label>
            <div className={styles.dateInput}>
              <input
                type="date"
                id="birthday"
                name="birthday"
                className={`${styles.input} ${errors.birthday ? styles.errorInput : ''}`}
                value={formData.birthday}
                onChange={handleChange}
                onBlur={(e) => validateField('birthday', e.target.value)}
                required
              />
              <FaCalendarAlt className={styles.calendarIcon} />
            </div>
            {errors.birthday && (
              <div className={styles.errorMessage}>{errors.birthday}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender" className={styles.label}>
              性別
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="gender"
                name="gender"
                className={styles.input}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
              <FaChevronDown className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              地址
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={styles.input}
              placeholder="預填地址可作為配送收件使用"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <button type="submit" className={styles.registerButton}>
            確認註冊
          </button>
        </form>
      </div>
    </div>
  )
}
