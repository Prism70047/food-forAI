'use client'

import { useState } from 'react'
import styles from '../styles/password-content.module.scss'
import { FaEye, FaEyeSlash } from '../../icons/icons'
import { toast } from 'react-toastify'

const PasswordContent = () => {
  // 密碼狀態
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // 密碼顯示/隱藏狀態
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  // 錯誤訊息狀態
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // 驗證密碼格式
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
    return passwordRegex.test(password)
  }

  // 驗證欄位
  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'currentPassword':
        if (!value) {
          error = '請輸入目前密碼'
        } else if (value.length < 8) {
          // 假設密碼最小長度為 8
          error = '密碼長度不正確'
        } else {
          // TODO:改為透過API驗證目前密碼是否正確 (目前是假資料)
          if (value !== 'Test1234') {
            error = '目前密碼輸入錯誤'
          }
        }
        break

      case 'newPassword':
        if (!value) {
          error = '請輸入新密碼'
        } else if (!validatePassword(value)) {
          error = '密碼需包含大小寫英文字母及數字，長度8-20碼'
        }
        break

      case 'confirmPassword':
        if (!value) {
          error = '請再次輸入新密碼'
        } else if (value !== passwords.newPassword) {
          error = '密碼不一致'
        }
        break
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    return !error
  }

  // 驗證目前密碼的函數
  const verifyCurrentPassword = async (password) => {
    try {
      // TODO:呼叫後端 API 進行密碼驗證
      // const response = await fetch('/api/verify-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ password }),
      // })
      // return response.ok

      // 範例：假設密碼是 "Test1234"
      return password === 'Test1234'
    } catch (error) {
      console.error('密碼驗證失敗：', error)
      return false
    }
  }

  // 處理密碼變更
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 切換密碼顯示/隱藏
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 驗證所有欄位
    const isCurrentPasswordValid = validateField(
      'currentPassword',
      passwords.currentPassword
    )
    const isNewPasswordValid = validateField(
      'newPassword',
      passwords.newPassword
    )
    const isConfirmPasswordValid = validateField(
      'confirmPassword',
      passwords.confirmPassword
    )

    if (
      !isCurrentPasswordValid ||
      !isNewPasswordValid ||
      !isConfirmPasswordValid
    ) {
      return
    }

    try {
      // 先驗證目前密碼是否正確
      const isCurrentPasswordCorrect = await verifyCurrentPassword(
        passwords.currentPassword
      )

      if (!isCurrentPasswordCorrect) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: '目前密碼輸入錯誤',
        }))
        return
      }

      // 如果目前密碼正確，才執行更新密碼
      // const response = await updatePassword(passwords)
      toast.success('密碼更新成功')

      // 清空表單
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('密碼更新失敗')
    }
  }

  return (
    <div className={styles.passwordContent}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            目前密碼 *
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.currentPassword ? 'text' : 'password'}
              name="currentPassword"
              id="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              onBlur={(e) => validateField('currentPassword', e.target.value)}
              placeholder="請輸入目前密碼"
              className={`${errors.currentPassword ? styles.errorInput : ''}`}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => togglePasswordVisibility('currentPassword')}
            >
              {showPasswords.currentPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.currentPassword && (
            <div className={styles.errorMessage}>{errors.currentPassword}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            輸入新的密碼 *
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.newPassword ? 'text' : 'password'}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              onBlur={(e) => validateField('newPassword', e.target.value)}
              placeholder="需包含大小寫英文字母及數字，長度8-20碼"
              className={`${errors.newPassword ? styles.errorInput : ''}`}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => togglePasswordVisibility('newPassword')}
            >
              {showPasswords.newPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.newPassword && (
            <div className={styles.errorMessage}>{errors.newPassword}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmNewPassword" className={styles.label}>
            再次輸入新的密碼 *
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              onBlur={(e) => validateField('confirmPassword', e.target.value)}
              placeholder="再次輸入新的密碼"
              className={`${errors.confirmPassword ? styles.errorInput : ''}`}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              {showPasswords.confirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className={styles.errorMessage}>{errors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          修改密碼
        </button>
      </form>
    </div>
  )
}

export default PasswordContent
