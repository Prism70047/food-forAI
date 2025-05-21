'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth-context'

const styles = {
  title: {
    color: '#423C3A',
    fontSize: 48,
    fontFamily: 'Noto Sans TC',
    fontWeight: '700',
    wordWrap: 'break-word',
  },
  subtitle: {
    color: '#423C3A',
    fontSize: 20,
    fontFamily: 'Noto Sans TC',
    fontWeight: '700',
    wordWrap: 'break-word',
  },
  placeholder: {
    color: '#C7C7C7',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0.6,
    wordWrap: 'break-word',
  },
  buttonText: {
    color: '#FAF8F9',
    fontSize: 36,
    fontFamily: 'Noto Sans TC',
    fontWeight: '700',
    wordWrap: 'break-word',
  },
}

export default function FoodFeeBack() {
  const { id } = useParams() // 從動態路由中獲取 recipeId
  const { auth } = useAuth()
  const [title, setTitle] = useState('')
  const [context, setComment] = useState('')
  const [isLike, setIsLike] = useState(0) // 預設為按讚

  console.log('recipeId:', id) // 確認 recipeId 是否正確獲取
  console.log('auth:', auth.id) // 確認 auth 是否正確獲取

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (title.trim() === '' || context.trim() === '') {
      alert('請填寫完整的標題和評論！')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:3001/recipes/api/feedback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipeId: id,
            userId: auth.id,
            title: title.trim(),
            context: context.trim(),
            is_like: isLike, // 確保 isLike 會是 0 或 1
          }), // 傳送 recipeId 和 userId
        }
      )

      const result = await response.json() // 新增這行來獲取回應內容

      if (response.ok) {
        alert('感謝您的評論！')
        setTitle('')
        setComment('')
        setIsLike(0)
      } else {
        alert(`提交失敗：${result.error}`) // 顯示具體的錯誤訊息
      }
    } catch (error) {
      console.error('提交表單時發生錯誤：', error)
      alert('提交失敗，請檢查您的網路連線！')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 800,
          paddingTop: 35,
          paddingBottom: 50,
          background: 'white',
          boxShadow: '2px 3px 8px rgba(0, 0, 0, 0.25)',
          borderRadius: 30,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 22,
          display: 'inline-flex',
        }}
      >
        <div style={styles.title}>撰寫評論</div>
        <div
          style={{
            alignSelf: 'stretch',
            paddingBottom: 20,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 30,
            display: 'flex',
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              paddingTop: 20,
              paddingLeft: 40,
              paddingRight: 40,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 15,
              display: 'flex',
            }}
          >
            <div style={styles.subtitle}>標題</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="標題請於20字內唷！"
              maxLength={20}
              style={{
                alignSelf: 'stretch',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 15,
                paddingRight: 17,
                background: '#FAF8F9',
                borderRadius: 15,
                outline: '2px #ECECEC solid',
                outlineOffset: '-2px',
                fontSize: 16,
                fontFamily: 'Inter',
              }}
            />
          </div>
          <div
            style={{
              alignSelf: 'stretch',
              paddingLeft: 40,
              paddingRight: 40,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 15,
              display: 'flex',
            }}
          >
            <div style={styles.subtitle}>評論</div>
            <textarea
              value={context}
              onChange={(e) => setComment(e.target.value)}
              placeholder="嘿~和大家說說您的感想吧~"
              style={{
                alignSelf: 'stretch',
                height: 113,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 15,
                paddingRight: 17,
                background: '#FAF8F9',
                borderRadius: 15,
                outline: '2px #ECECEC solid',
                outlineOffset: '-2px',
                fontSize: 16,
                fontFamily: 'Inter',
                resize: 'none',
              }}
            />
          </div>
          <div
            style={{
              alignSelf: 'stretch',
              paddingLeft: 40,
              paddingRight: 40,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 10,
              display: 'flex',
            }}
          >
            <input
              type="checkbox"
              checked={isLike === 1}
              onChange={(e) => setIsLike(e.target.checked ? 1 : 0)}
            />
            <label>我喜歡這個食譜</label>
          </div>
        </div>
        <button
          type="submit"
          style={{
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 25,
            paddingBottom: 25,
            background: '#DF6C2D',
            boxShadow: '0px 0px 0px 15px rgba(0, 0, 0, 0.05)',
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'inline-flex',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={styles.buttonText}>送出</div>
        </button>
      </form>
    </div>
  )
}
