'use client'

import React, { useState, useEffect, useCallback } from 'react'
// useState 記東西的（購物車裡商品）
// useEffect 在特定時間做事
import { useAuth } from '@/hooks/auth-context'
import './style.css' // style.css 在同一資料夾或正確路徑
import { useRouter } from 'next/navigation'

export default function CartPage() {
  //--- 狀態 ---
  //箱子
  const [cartItems, setCartItems] = useState([])
  //狀態指示燈
  const [loading, setLoading] = useState(true)
  //錯誤訊息
  const [error, setError] = useState(null)
  // 一開始顯示折扣金額0
  const [discountAmount, setDiscountAmount] = useState(0)
  // 儲存輸入的折扣碼
  const [couponCode, setCouponCode] = useState('')
  // 紀錄已套用的折扣碼
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  // 檢查（沒過跳紅字）
  const handleProceedToContact = () => {
    console.log('🚀 準備前往 /cart/contact 頁面！')
    router.push('/cart/contact') // 執行跳轉
  }
  // 購物車
  const [isAllSelected, setIsAllSelected] = useState(true) // 全選狀態

  //--- Hooks 和常數宣告區 ---
  // 使用router頁面跳轉
  const router = useRouter()
  const { auth } = useAuth()
  const currentUserId = auth?.id
  // 後端api port
  const API_BASE_URL = 'http://localhost:3001'

  useEffect(() => {
    if (auth && currentUserId && currentUserId !== 0) {
      console.log(`✅ 使用者 ${currentUserId} 已登入，準備撈取購物車！`)
      setLoading(true)
      setError(null)
      fetch(`${API_BASE_URL}/cart/api/${currentUserId}`)
        .then((response) => {
          console.log(
            `📞 後端 API (${response.url}) 回應狀態：${response.status}${currentUserId}`
          )
          if (!response.ok) {
            return response
              .json()
              .then((errorData) => {
                throw new Error(
                  errorData.message || `請求失敗，狀態碼：${response.status}`
                )
              })
              .catch(() => {
                throw new Error(
                  `請求失敗，狀態碼：${response.status} (且錯誤內容非JSON)`
                )
              })
          }
          return response.json()
        })
        .then((dataFromApi) => {
          console.log(
            `🎉 成功從後端拿到使用者 ${currentUserId} 的購物車資料：`,
            dataFromApi
          )
          // cartItems 時加上 isSelected 屬性
          const itemsWithSelection = dataFromApi.map((item) => ({
            ...item,
            isSelected: true, // 預設全部勾選
          }))
          setCartItems(itemsWithSelection)
          // 根據載入的資料，判斷是否要維持全選狀態
          if (itemsWithSelection.length > 0) {
            setIsAllSelected(
              itemsWithSelection.every((item) => item.isSelected)
            )
          } else {
            setIsAllSelected(false) // 如果購物車是空的，全選自然是 false
          }
        })
        .catch((err) => {
          console.error('😭 撈取購物車資料時發生悲劇：', err)
          setError(err.message || '發生未知的錯誤，請稍後再試。')
          setCartItems([])
          setIsAllSelected(false) // 出錯時也取消全選
        })
        .finally(() => {
          setLoading(false)
          console.log('🏁 初始購物車 API 請求流程結束。')
        })
    } else {
      console.log(
        '🚫 使用者未登入或 userId 無效，不執行 API 請求。 auth:',
        auth,
        'userId:',
        currentUserId
      )
      let userMessage = '請先登入才能查看您的購物車喔～😉'
      if (auth && (!currentUserId || currentUserId === 0)) {
        userMessage = '登入狀態好像有點怪怪的，拿不到正確的使用者ID耶～🤔'
      }
      setError(userMessage)
      setCartItems([])
      setIsAllSelected(false) // 如果沒有登入，購物車也不會有東西
      setLoading(false)
    }
  }, [currentUserId, auth]) // 依賴 currentUserId 和 auth

  // 全選/取消全選
  const handleSelectAll = useCallback((event) => {
    const newIsAllSelected = event.target.checked
    setIsAllSelected(newIsAllSelected)
    setCartItems((prevItems) =>
      prevItems.map((item) => ({ ...item, isSelected: newIsAllSelected }))
    )
  }, [])

  // 單一商品勾選/取消勾選
  const handleSelectItem = useCallback(
    (cartItemIdToToggle, event) => {
      const newIsItemSelected = event.target.checked
      const updatedItems = cartItems.map((item) =>
        item.cartItemId === cartItemIdToToggle
          ? { ...item, isSelected: newIsItemSelected }
          : item
      )
      setCartItems(updatedItems)
      setIsAllSelected(
        updatedItems.length > 0 && updatedItems.every((item) => item.isSelected)
      )
    },
    [cartItems]
  )
  const handleDeleteItem = useCallback(
    async (cartItemIdPassed) => {
      if (!cartItemIdPassed) return
      // setLoading(true); // 如果需要更細緻的 loading
      // setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/cart/api/items/${cartItemIdPassed}`,
          { method: 'DELETE' }
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `刪除商品失敗`)
        }
        const updatedItems = cartItems.filter(
          (item) => item.cartItemId !== cartItemIdPassed
        )
        setCartItems(updatedItems)
        // ✨✨✨ 新增5: 刪除後也要更新全選狀態 ✨✨✨
        setIsAllSelected(
          updatedItems.length > 0 &&
            updatedItems.every((item) => item.isSelected)
        )
        setError(null)
      } catch (err) {
        setError(err.message || '刪除商品時發生錯誤')
      } finally {
        // setLoading(false);
      }
    },
    [API_BASE_URL, cartItems]
  ) // 依賴 cartItems

  // --- 更新購物車項目數量的函式 ---
  const handleUpdateQuantity = useCallback(
    async (cartItemId, currentQuantity, change) => {
      const itemToUpdate = cartItems.find(
        (item) => item.cartItemId === cartItemId
      ) // ✨✨✨ 先找到它！ ✨✨✨
      if (!itemToUpdate) {
        // ✨✨✨ 如果找不到，就不要玩了！ ✨✨✨
        console.error(
          `更新數量錯誤：在 cartItems 中找不到 cartItemId 為 ${cartItemId} 的商品`
        )
        setError(`哎呀！你想更新的商品好像消失了耶～🤔`)
        return
      }

      const newQuantity = currentQuantity + change
      if (newQuantity < 1) {
        if (
          window.confirm(
            `確定要從購物車移除【${itemToUpdate.name}】嗎？它會哭哭喔～😢`
          )
        ) {
          // 現在可以安全使用 itemToUpdate.name
          await handleDeleteItem(cartItemId)
        }
        return // 不往下執行更新數量
      }

      // 暫時先不實作庫存檢查的 loading
      // setLoading(true); // 如果要加 loading 狀態可以打開
      // setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/cart/api/items/${cartItemId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${yourAuthToken}`, // 如果需要 JWT
            },
            body: JSON.stringify({ quantity: newQuantity }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || `更新商品數量失敗，狀態碼：${response.status}`
          )
        }

        // 更新成功後，直接修改前端的 cartItems state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
        console.log(`🛒 商品 ${cartItemId} 數量已更新為 ${newQuantity}`)
      } catch (err) {
        console.error(`💔 更新購物車項目 ${cartItemId} 數量失敗：`, err)
        setError(err.message || '更新數量時發生錯誤，請稍後再試。')
        // 這裡可以考慮是否要回復到更新前的數量，或者重新 fetch 一次購物車
      } finally {
        // setLoading(false); // 如果前面有打開 loading
      }
    },
    [API_BASE_URL, cartItems, handleDeleteItem]
  ) // handleDeleteItem 加入依賴

  // --- 從購物車移除商品的函式 ---
  const handleDeleteClick = useCallback(
    async (cartItemId) => {
      // 暫時先不實作刪除的 loading
      // setLoading(true);
      // setError(null);
      console.log(`🗑️ 準備刪除購物車項目 ID: ${cartItemId}`)
      try {
        const response = await fetch(
          `${API_BASE_URL}/cart/api/items/${cartItemId}`,
          {
            method: 'DELETE',
            // headers: { 'Authorization': `Bearer ${yourAuthToken}` }, // 如果需要 JWT
          }
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || `刪除商品失敗，狀態碼：${response.status}`
          )
        }
        // 成功刪除後，從前端的 cartItems 狀態中移除該商品
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.cartItemId !== cartItemId)
        )
        console.log(`✅ 商品 ${cartItemId} 已成功從購物車移除！`)
      } catch (err) {
        console.error(`💣 刪除購物車項目 ${cartItemId} 失敗：`, err)
        setError(err.message || '刪除商品時發生錯誤，請稍後再試。')
      } finally {
        // setLoading(false);
      }
    },
    [API_BASE_URL, cartItems, handleDeleteItem]
  ) // handleDeleteItem 加入依賴

  // ✨✨✨ 新增6: 處理商品列表「移除」按鈕的函式 (使用 window.confirm) ✨✨✨
  const handleDirectDeleteClick = (cartItemId, itemName) => {
    if (window.confirm(`你確定要把【${itemName}】從購物車中丟掉嗎？`)) {
      handleDeleteItem(cartItemId)
    }
  }
  // calculateSelectedSubtotal 函式
  const calculateSelectedSubtotal = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      return 0
    }
    return cartItems
      .filter((item) => item.isSelected) // 只計算 isSelected: true 的
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = parseInt(item.quantity, 10) || 0
        return total + price * quantity
      }, 0)
  }, [cartItems]) // 依賴 cartItems，因為勾選狀態或數量改變時，小計要重算
  // 呼叫selectedSubtotal
  const selectedSubtotal = calculateSelectedSubtotal()
  // --- 計算訂單金額 ---
  const calculateSubtotal = useCallback(() => {
    if (!cartItems || cartItems.length === 0) return 0
    return cartItems
      .filter((item) => item.isSelected) // 只計算 isSelected: true 的
      .reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cartItems])

  const subtotal = calculateSubtotal()
  const shippingFee = 0 // 假設運費暫時是 0
  const grandTotal = selectedSubtotal + shippingFee - discountAmount // 總金額 = 小計 + 運費 - 折扣金額
  console.log(cartItems)

  //取得已勾選的商品列表
  const selectedItems = cartItems.filter((item) => item.isSelected)

  // 處理優惠券
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setError('請先輸入優惠券代碼啦～不然怎麼折給你！😜')
      return
    }

    console.log(`🧾 準備驗證優惠券：${couponCode}`)
    setError(null) //清除錯誤提示
    // setLoading(true) //loading 效果

    // 模擬前端判斷，真實情境應由後端處理
    let actualDiscount = 0
    const upperCaseCoupon = couponCode.toUpperCase()
    const currentTimestamp = new Date() // 用於比較日期

    if (upperCaseCoupon === 'SUMMERFUN150') {
      // 根據您的資料庫資料模擬判斷
      const startDate = new Date('2025-05-01 00:00:00')
      const endDate = new Date('2025-07-31 23:59:59')
      const isActive = true // 資料 is_active = TRUE
      const minPurchase = 1000 // "消費滿千折 NT$150"

      if (!isActive) {
        setError(`Oops！優惠券 "${couponCode}" 目前沒有啟用喔～`)
      } else if (currentTimestamp < startDate) {
        setError(
          `優惠券 "${couponCode}" 還沒開始喔，生效日期是 ${startDate.toLocaleDateString()}！`
        )
      } else if (currentTimestamp > endDate) {
        setError(
          `哎呀！優惠券 "${couponCode}" 已經在 ${endDate.toLocaleDateString()} 過期囉～哭哭`
        )
      } else if (subtotal < minPurchase) {
        setError(
          `差一點點！使用 "${couponCode}" 需要消費滿 NT$${minPurchase}，您目前小計 NT$${subtotal.toFixed(2)}。`
        )
      } else {
        actualDiscount = 150.0 //  discount_value 是 150.00
        setError(
          `🎉 優惠券 "${couponCode}" 套用成功！折抵 NT$${actualDiscount.toFixed(2)}！`
        )
      }
    } else {
      setError(
        `Oops！優惠券 "${couponCode}" 好像不太對勁喔，找不到這張好康耶～再檢查一下？🤔`
      )
    }
    setDiscountAmount(actualDiscount) // 更新折扣金額
  }, [couponCode, subtotal]) // 當 couponCode 或 subtotal 改變時，重新計算

  // --- JSX 渲染邏輯 ---
  if (loading && cartItems.length === 0) {
    // 只有在初始載入且還沒有任何 cartItems 時才顯示全頁 loading
    return (
      <div className="cart-page-status">
        <p>購物車努力搬貨中... 🚚💨 請稍等一下下，好料馬上來！</p>
      </div>
    )
  }

  if (error && cartItems.length === 0) {
    // 只有在購物車也沒東西時才優先顯示整個頁面的錯誤
    return (
      <div className="cart-page-status cart-page-error">
        <h2>糟糕，出包了！😱</h2>
        <p>{error}</p>
        <p>
          你可以試試看
          <button
            onClick={() => window.location.reload()}
            style={{ marginLeft: '5px', padding: '5px 10px' }}
          >
            重新整理
          </button>
          ，或檢查一下登入狀態喔！
        </p>
      </div>
    )
  }

  if (!loading && cartItems.length === 0 && !error) {
    // 載入完成，但購物車是空的 (且沒有致命錯誤)
    return (
      <div className="cart-page-status cart-page-empty">
        <link rel="stylesheet" href="style.css" /> {/* 確保空狀態也有樣式 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.12.1/font/bootstrap-icons.min.css"
        />
        <h1>我的購物清單</h1>
        <p>你的購物車空空如也～ 🛒 是時候發揮你的購物慾啦！</p>
        <p>快去把心愛的商品通通加進來吧！Let's Go Shopping! 🛍️</p>
        {error && (
          <p style={{ color: 'orange', marginTop: '10px' }}>
            小小提示：{error}
          </p>
        )}{' '}
        {/* 如果有非致命錯誤，還是可以提示一下 */}
      </div>
    )
  }

  // 購物車有商品時的渲染
  return (
    <div>
      <link rel="stylesheet" href="style.css" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.12.1/font/bootstrap-icons.min.css"
      />
      {/* 你的 Header 元件可以放在這裡 (如果 AuthProvider 是在更外層) */}
      <main>
        <div className="container">
          <h1>
            購物清單 {/* ✨✨✨ 新增8: 顯示已選/總數 ✨✨✨ */}
            {cartItems.length > 0 && (
              <span
                style={{ fontSize: '0.7em', marginLeft: '10px', color: '#555' }}
              >
                (已選 {selectedItems.length} / 共 {cartItems.length} 件)
              </span>
            )}
          </h1>
          {error && cartItems.length > 0 /* 有商品時，錯誤訊息放上面 */ && (
            <p
              style={{
                color: 'orange',
                textAlign: 'center',
                marginBottom: '15px',
                background: '#fff3cd',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ffeeba',
              }}
            >
              {error}
            </p>
          )}{' '}
          {/*優惠券套用成功顯示文字*/}
          <div className="checkout-layout">
            <div className="checkout-left">
              <section className="shopping-list">
                {/* ✨✨✨ 新增9: 全選 Checkbox ✨✨✨ */}
                {cartItems.length > 0 && (
                  <div
                    className="cart-select-all"
                    style={{
                      /* ...你的樣式... */ display: 'flex',
                      alignItems: 'center',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="selectAllCheckbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      disabled={loading || cartItems.length === 0}
                      style={{
                        marginRight: '10px',
                        transform: 'scale(1.2)',
                        cursor: 'pointer',
                      }}
                    />
                    <label
                      htmlFor="selectAllCheckbox"
                      style={{
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {isAllSelected
                        ? '取消全選'
                        : `全選 (${cartItems.length}件)`}
                    </label>
                  </div>
                )}
                {cartItems.map((item) => (
                  //顯示出item的資料
                  <>
                    <div
                      className="cart-item"
                      key={item.cartItemId || item.productId} // 優先使用 cartItemId
                      style={{
                        opacity: loading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      {/* ✨✨✨ 新增10: 單一商品 Checkbox ✨✨✨ */}
                      <input
                        type="checkbox"
                        className="cart-item__checkbox" // 建議給個 class 加樣式
                        checked={item.isSelected || false}
                        onChange={(e) => handleSelectItem(item.cartItemId, e)}
                        disabled={loading}
                        style={{
                          marginRight: '15px',
                          transform: 'scale(1.2)',
                          cursor: 'pointer',
                        }}
                      />
                      <img
                        src={item.imageUrl || '/images/default_product.png'}
                        alt={item.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          marginRight: '15px',
                          borderRadius: '4px',
                          border: '1px solid #eee',
                        }}
                      />
                      <div className="item-details">
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '0.9em', color: '#777' }}>
                          商品ID: {item.productId}
                        </p>
                      </div>
                      <div className="item-quantity">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              item.quantity,
                              -1
                            )
                          }
                          disabled={loading}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          readOnly
                          style={{
                            width: '40px',
                            textAlign: 'center',
                            margin: '0 5px',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                          }}
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              item.quantity,
                              1
                            )
                          }
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                      <div
                        className="item-price"
                        style={{
                          minWidth: '80px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                        }}
                      >
                        $
                        {item.price
                          ? (item.price * item.quantity).toFixed(2)
                          : 'N/A'}{' '}
                        {/* 顯示該項目總價 */}
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteClick(item.cartItemId, item.name)
                        }
                        disabled={loading}
                        title="移除商品"
                        style={{
                          marginLeft: '15px',
                          background: 'transparent',
                          border: 'none',
                          color: '#e74c3c',
                          cursor: 'pointer',
                          fontSize: '1.2em',
                        }}
                      >
                        <i className="bi bi-trash3-fill"></i>{' '}
                        {/* 使用 Bootstrap Icon */}
                      </button>
                    </div>
                  </>
                ))}
                {/*{cartItems.length > 0 && ( // 只有購物車有東西才顯示優惠券
                  <div className="coupon-code">
                    <input type="text" placeholder="輸入優惠券代碼"value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    disabled={loading}/>
                    
                    <button onClick={handleApplyCoupon} disabled={loading}>使用優惠券</button>
                  </div>
                )}*/}
              </section>
            </div>
            {/* 右邊訂單總計 */}
            <aside className="checkout-right">
              <div className="order-summary">
                <h2>訂單總計</h2>
                <div className="summary-item">
                  <span>商品小計</span>
                  <span>NT ${selectedSubtotal.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>運費</span>
                  <span>NT ${shippingFee.toFixed(2)}</span>
                </div>
                <div className="summary-item discount">
                  <span>優惠折扣</span>
                  <span>
                    {discountAmount > 0 ? '- NT $' : 'NT $'}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="summary-item total">
                  <span>總金額</span>
                  <span>NT ${grandTotal.toFixed(2)}</span>
                </div>
                {/* 優惠券輸入 */}
                {cartItems.length > 0 && ( // 只有購物車有東西才顯示優惠券
                  <div className="coupon-code">
                    <input
                      type="text"
                      placeholder="輸入優惠券代碼"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={loading}
                      // 給優惠卷input的class
                      className="coupon-code__input"
                    />

                    <button
                      onClick={handleApplyCoupon}
                      disabled={loading}
                      // 使用優惠卷按鍵
                      className="coupon-code__button"
                    >
                      使用優惠券
                    </button>
                  </div>
                )}

                <button
                  className="btn-proceed-payment"
                  disabled={selectedItems.length === 0 || loading}
                  // onClick執行跳轉
                  onClick={handleProceedToContact}
                >
                  {' '}
                  {/* 沒商品或載入中不能按 */}
                  下一步 前往付款方式 🚀
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
