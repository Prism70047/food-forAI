'use client'
import React, { useState } from 'react' // 把 use 改成 useState
import styles from '../../src/styles/page-styles/PaymentForm.module.scss'
import { CiCreditCard1 } from 'react-icons/ci' // 使用 react-icons 套件來引入信用卡 icon

import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'animate.css'

const PaymentForm = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState('creditCard') // 'creditCard' 或 'linePay'
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  })

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method)
    // 切換付款方式時，也可以考慮清空表單資料
    setFormData({
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCreditCardSubmit = (e) => {
    e.preventDefault()
    console.log('信用卡表單資料準備送出:', formData)
    alert('信用卡表單已送出！請查看 console 的資料')
    // 之後的邏輯：送 formData 到後端處理信用卡付款
  }

  const handleLinePaySubmit = () => {
    console.log('準備進行 LINE Pay 付款...')
    alert(
      '即將導向 LINE Pay 或顯示 QR Code (這部分需要後端與 LINE Pay API 串接)！'
    )
    // 之後的邏輯：
    // 1. 呼叫你的後端 API，後端再去跟 LINE Pay API 溝通取得付款連結或 QR Code
    // 2. 前端根據後端的回應，導向 LINE Pay 頁面或顯示 QR Code
  }

  return (
    // 最外層的 wrapper
    <div className={styles.paymentPageWrapper}>
      <div className={styles.paymentFormContainer}>
        {/* H2 標題 */}
        <h2 className={styles.formHeaderTitle}>選擇付款方式</h2>

        {/* 付款方式按鈕 */}
        <div className={styles.paymentMethodSelector}>
          <button
            type="button"
            className={`${styles.methodButton} ${selectedPaymentMethod === 'creditCard' ? styles.active : ''}`}
            onClick={() => handlePaymentMethodChange('creditCard')}
          >
            {/* card icon */}
            <CiCreditCard1 className={styles.paymentIcon} />
            信用卡
          </button>
          <button
            type="button"
            className={`${styles.methodButton} ${selectedPaymentMethod === 'linePay' ? styles.active : ''}`}
            onClick={() => handlePaymentMethodChange('linePay')}
          >
            {/* line.png*/}
            <img
              src="/images/cart/line.png"
              alt="LINE Pay"
              className={`${styles.paymentIcon} ${styles.linePayIcon}`}
            />
            LINE Pay
          </button>
        </div>

        {selectedPaymentMethod === 'creditCard' && (
          <form
            onSubmit={handleCreditCardSubmit}
            className={styles.paymentForm}
          >
            <h3>信用卡資訊 💳</h3>
            {/* 假設 formGroup, formRow, submitButton 等都定義在 PaymentForm.module.css */}
            <div className={styles.formGroup}>
              <label htmlFor="cardNumber">信用卡號碼</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="**** **** **** ****"
                maxLength="19"
                pattern="[\d\s]{16,19}"
                title="請輸入有效的信用卡號碼"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cardName">持卡人姓名</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="例如：陳肥肥 (CHEN FEI-FEI)"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.expiryDate}`}>
                {' '}
                {/* 可以組合多個 module class */}
                <label htmlFor="expiryMonth">有效月份</label>
                <input
                  type="text"
                  id="expiryMonth"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleChange}
                  placeholder="MM (例如：09)"
                  maxLength="2"
                  pattern="\d{2}"
                  title="請輸入兩位數月份，例如 09"
                  required
                />
              </div>
              <div className={`${styles.formGroup} ${styles.expiryDate}`}>
                <label htmlFor="expiryYear">有效年份</label>
                <input
                  type="text"
                  id="expiryYear"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleChange}
                  placeholder="YYYY (例如：2028)"
                  maxLength="4"
                  pattern="\d{4}"
                  title="請輸入四位數年份，例如 2028"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cvv">安全碼 (CVV)</label>
              <input
                type="password"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="卡片背面的末三碼"
                maxLength="3"
                pattern="\d{3}"
                title="請輸入卡片背面的三位數安全碼"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              使用信用卡付款
            </button>
          </form>
        )}

        {selectedPaymentMethod === 'linePay' && (
          <div className={styles.linePaySection}>
            <h3>LINE Pay 付款</h3>
            <p>點擊下方按鈕，將引導您至 LINE Pay 完成付款。</p>
            <button
              type="button"
              onClick={handleLinePaySubmit}
              className={`${styles.submitButton} ${styles.linePayButton}`}
            >
              前往 LINE Pay 付款
            </button>
            <p className={styles.linePayNote}>
              {/* 實際 LINE Pay 串接需要在您的 Node.js 後端與 LINE Pay API 進行整合。
              前端主要負責觸發流程並接收後端的回應。*/}
            </p>
          </div>
        )}
      </div>
      {/* sticker */}
      <LazyLoadImage
        src="../images/design/cart-sticker-01.svg"
        delayTime={300}
        className={`${styles.sticker1} animate__animated animate__fadeInRight`}
        alt="POS機"
      />
      <LazyLoadImage
        src="../images/design/cart-sticker-02.svg"
        delayTime={300}
        className={`${styles.sticker2} animate__animated animate__fadeInLeft`}
        alt="people"
      />
    </div>
  )
}

export default PaymentForm
