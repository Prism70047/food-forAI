'use client'

import React, { useState } from 'react'
import styles from '../styles/Contact.module.css'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // 防止表單預設提交行為

    try {
      const response = await fetch('http://localhost:3001/contact/api', {
        method: 'POST', // 使用 POST 方法
        headers: {
          'Content-Type': 'application/json', // 設定請求的內容類型
        },
        body: JSON.stringify(formData), // 將表單資料轉換為 JSON 格式
      })

      if (response.ok) {
        alert('感謝您的留言，我們會盡快回覆！')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        alert('提交失敗，請稍後再試！')
      }
    } catch (error) {
      console.error('提交表單時發生錯誤：', error)
      alert('提交失敗，請檢查您的網路連線！')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageWrapper}>
        <div className={styles.heroSection}>
          <div className={styles.imageContainer}>
            <div className={styles.heroImage}>
              <div className={styles.heroTitle}>
                CONTACT US
                <br />
                聯絡我們
              </div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6450f8ecb0c2b20faf4281b53a69621902c74417?placeholderIfAbsent=true"
                className={styles.rightDecoration}
                alt="Decoration"
              />
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6ea0d3474bfe8fe95aff977946a5c9bb19c35fc8?placeholderIfAbsent=true"
                className={styles.leftDecoration}
                alt="Decoration"
              />
            </div>
          </div>
        </div>

        <div className={styles.faqSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionTitle}>常見問題</div>
            <div className={styles.sectionDescription}>
              以下是一些常見問題的分類
            </div>
          </div>

          <div className={styles.faqList}>
            <div className={styles.faqRow}>
              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>❓</div>
                <div className={styles.faqContent}>
                  <div className={styles.faqItemTitle}>食譜相關</div>
                  <div className={styles.faqItemSubtitle}>步驟詳解</div>
                </div>
                <div className={styles.faqItemDescription}>
                  與食譜有關的問題與解答。
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>❓</div>
                <div className={styles.faqContent}>
                  <div className={styles.faqItemTitle}>商城相關</div>
                  <div className={styles.faqItemSubtitle}>買賣流程</div>
                </div>
                <div className={styles.faqItemDescription}>
                  與商城有關的問題與解答。
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>❓</div>
                <div className={styles.faqContent}>
                  <div className={styles.faqItemTitle}>退換貨與客服</div>
                  <div className={styles.faqItemSubtitle}>立即聯繫</div>
                </div>
                <div className={styles.faqItemDescription}>
                  與退換貨、聯繫客服有關的問題與解答。
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contactForm}>
          <div className={styles.formWrapper}>
            <div className={styles.formContainer}>
              <div className={styles.formTitle}>聯繫我們</div>
              <div className={styles.formDescription}>
                有任何疑問或建議？歡迎留言給我們！
              </div>
            </div>

            <form className={styles.formFields} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>姓名</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.textField}
                    placeholder="請輸入您的姓名"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>郵件</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.textField}
                    placeholder="請輸入您的郵件"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>主旨分類</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.textField}
                    required
                  >
                    <option value="">請選擇主旨類型</option>
                    <option value="recipe">食譜相關</option>
                    <option value="shop">商城相關</option>
                    <option value="return">退換貨與客服</option>
                    <option value="other">其他問題</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>留言內容</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${styles.textField} ${styles.textArea}`}
                    placeholder="請輸入留言內容"
                    rows="5"
                    required
                  ></textarea>
                </div>
              </div>

              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.submitButton}>
                  送出
                </button>
              </div>
            </form>
          </div>

          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/aabb5e760a09740ad2a211407a0e5769f1e2dc42?placeholderIfAbsent=true"
            className={styles.rightImage}
            alt="Decoration"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/853a1999151de669b402e72ec53a47a2da7a1b1f?placeholderIfAbsent=true"
            className={styles.leftImage}
            alt="Decoration"
          />
        </div>
      </div>
    </div>
  )
}

export default ContactPage
