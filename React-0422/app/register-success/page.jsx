'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './styles/RegisterSuccess.module.scss'

export default function RegisterSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    const redirect = setTimeout(() => {
      router.push('/login')
    }, 5000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [router])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
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
        <div className={styles.messageContainer}>
          <p className={styles.message}>您已成功完成註冊！現在可以進行登入</p>
          <p className={styles.message}>{countdown} 秒後自動跳轉至登入頁面</p>
        </div>
        <Link href="/login" legacyBehavior>
          <a className={styles.linkButton}>立即登入</a>
        </Link>
      </div>
    </div>
  )
}
