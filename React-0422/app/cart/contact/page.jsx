'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../style.css' 


// 如果 CartPage 的 style.css 是在 src/app/cart/style.css
// 那這裡可能要用 import '@/app/cart/style.css' 或其他相對/絕對路徑
// 為了簡單起見，先假設 style.css 可以被 ContactPage 存取到
// import '../cart/style.css'; // 假設 CartPage.jsx 和 style.css 在 cart 資料夾內
// 如果你的 style.css 在 public 資料夾，那你應該是在 <Head> 引入，這裡不用特別 import
// 最好的方式是 ContactPage 也有自己的 CSS Module 或全域 CSS

export default function ContactPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    address: '',
  });
  const [notes, setNotes] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({}); // 用來處理表單驗證錯誤

  useEffect(() => {
    // 從 localStorage 讀取訂單摘要
    const storedDetails = localStorage.getItem('currentOrderDetails');
    if (storedDetails) {
      try {
        const parsedDetails = JSON.parse(storedDetails);
        setOrderDetails(parsedDetails);
        console.log('📦 聯絡資訊頁面：成功載入訂單摘要', parsedDetails);
      } catch (error) {
        console.error('😭 解析 localStorage 中的訂單摘要失敗:', error);
        // 開發階段，就算解析失敗也先不要跳轉，給個預設值方便看版型
        // alert('糟糕，讀取訂單資訊失敗，請返回購物車重試 T_T');
        // router.push('/cart'); // 導回購物車

        // 預覽使用
        setOrderDetails({
            subtotal: 0, shippingFee: 0, discountAmount: 0, grandTotal: 0, cartItems: [], userId: null, error: 'localStorage data corrupted'
    });
      }
    } else {
        //預覽使用
        console.warn('🤔 聯絡資訊頁面：找不到訂單摘要，開發模式下顯示預設內容。');
        // 在開發時，如果 localStorage 沒有資料，也先不要跳轉，給一個預設的 orderDetails
        // 這樣你才能看到頁面的基本結構
        setOrderDetails({
          subtotal: 100, // 給點假資料方便看樣式
          shippingFee: 10,
          discountAmount: 5,
          grandTotal: 105,
          cartItems: [{productId: 'p1', name: '測試商品', quantity: 1, price: 100, imageUrl: ''}],
          userId: 'testUser',
        });
      // console.warn('🤔 聯絡資訊頁面：找不到訂單摘要，可能使用者不是從購物車來的喔！');
      // alert('請先從購物車過來唷～不然我不知道你要買啥 XD');
      // router.push('/cart'); // 導回購物車
    }
    setLoading(false);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipient((prev) => ({ ...prev, [name]: value }));
    // 清除該欄位的錯誤提示
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // 簡易表單驗證函式
  const validateForm = () => {
    const errors = {};
    if (!recipient.name.trim()) errors.name = '請告訴我你的大名～🥺';
    if (!recipient.phone.trim()) errors.phone = '手機號碼忘了填喔！📞';
    else if (!/^\d{10}$/.test(recipient.phone.trim())) errors.phone = '手機號碼格式好像不太對，請輸入10個數字。';
    if (!recipient.email.trim()) errors.email = 'Email 也要填一下啦，訂單通知要寄去哪？';
    else if (!/\S+@\S+\.\S+/.test(recipient.email.trim())) errors.email = '這個 Email 格式...嗯...再檢查一下？🧐';
    if (!recipient.city.trim()) errors.city = '哪個縣市呢？';
    if (!recipient.district.trim()) errors.district = '鄉鎮市區？';
    if (!recipient.address.trim()) errors.address = '詳細地址才能把好東西送到你手上喔！';

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // 如果沒有錯誤訊息，代表驗證通過
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止表單預設的提交跳轉行為
    if (!validateForm()) {
      alert('有些資料好像漏填或格式不太對喔，檢查一下紅字提示的地方吧！😉');
      return;
    }

    if (!orderDetails) {
      alert("訂單資訊不完整，請返回購物車重試。");
      return;
    }

    console.log('📦 準備提交的訂單資料：');
    console.log('收件人:', recipient);
    console.log('訂單備註:', notes);
    console.log('訂單摘要:', orderDetails);

    // --- 接下來是串接後端 API 的部分 ---
    // setLoading(true);
    // try {
    //   const response = await fetch('/api/your-checkout-endpoint', { // 你的後端 API 端點
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       recipientInfo: recipient,
    //       orderNotes: notes,
    //       // 把 orderDetails 裡需要的資訊 (例如 cartItems, grandTotal, userId) 一起送出
    //       cart: orderDetails.cartItems,
    //       totalAmount: orderDetails.grandTotal,
    //       userId: orderDetails.userId,
    //       // 你可能還需要支付方式等其他資訊
    //     }),
    //   });
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || '訂單提交失敗，請稍後再試');
    //   }
    //   const result = await response.json();
    //   console.log('🎉 訂單成功提交！後端回應：', result);
    //   localStorage.removeItem('currentOrderDetails'); // 成功後清除 localStorage
    //   // router.push(`/thank-you-page?orderId=${result.orderId}`); // 跳轉到感謝頁面，並帶上訂單ID
    //   alert('訂單資料看起來都OK！下一步就是把這些資料送去伺服器處理囉～（模擬成功）');
       router.push('/cart/payment'); // 暫時先跳回首頁
    // } catch (error) {
    //   console.error('😭 訂單提交時發生錯誤:', error);
    //   alert(`訂單提交失敗：${error.message}，請檢查網路或稍後再試 Q_Q`);
    // } finally {
    //   setLoading(false);
    // }
    // alert('下一步：把這些資料送去後端處理！（這部分還沒串接喔～）'); //開發先註解 也可以打開
  };

  if (loading || !orderDetails) {
    return (
      <div className="cart-page-status">
        <p>正在準備您的訂單資訊... 🏇💨</p>
      </div>
    );
  }

  return (
    <div>
      {/* 確保你有引入 Bootstrap Icons 或其他 Icon Font */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.12.1/font/bootstrap-icons.min.css"
      />
      {/* 沿用購物車的 CSS 或你有自己的 Contact 頁面 CSS */}
      {/* <link rel="stylesheet" href="../cart/style.css" /> */}
      <style jsx global>{`
        /* 簡易的錯誤提示樣式，你可以放到你的全域 CSS 或 Contact 頁面的 CSS Module */
        .form-group .error-text {
          color: red;
          font-size: 0.875em;
          margin-top: 4px;
        }
        .form-group input.input-error,
        .form-group textarea.input-error {
          border-color: red;
        }
      `}</style>

      <main>
        <div className="container">
          <h1>填寫收件資訊</h1>
          {/*<p>就差這一步啦！填完好料馬上送到家～ 🚀</p>*/}

          <div className="checkout-layout"> {/* 保持跟購物車頁類似的左右佈局 */}
            <div className="checkout-left">
              <form onSubmit={handleSubmit}>
                <section className="recipient-info">
                  <h2>收件人資料</h2>
                  <div className="form-group">
                    <label htmlFor="name">姓名</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={recipient.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? 'input-error' : ''}
                    />
                    {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">手機號碼</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={recipient.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? 'input-error' : ''}
                    />
                    {formErrors.phone && <p className="error-text">{formErrors.phone}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={recipient.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'input-error' : ''}
                    />
                    {formErrors.email && <p className="error-text">{formErrors.email}</p>}
                  </div>
                  <div className="form-group address-group">
                    <label>收件地址</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="縣市 (例如：高雄市)"
                      value={recipient.city}
                      onChange={handleInputChange}
                      className={formErrors.city ? 'input-error' : ''}
                    />
                    {formErrors.city && <p className="error-text">{formErrors.city}</p>}
                    <input
                      type="text"
                      name="district"
                      placeholder="鄉鎮市區 (例如：鳳山區)"
                      value={recipient.district}
                      onChange={handleInputChange}
                      className={formErrors.district ? 'input-error' : ''}
                    />
                    {formErrors.district && <p className="error-text">{formErrors.district}</p>}
                    <input
                      type="text"
                      name="address"
                      placeholder="詳細地址 (例如：光遠路123號)"
                      value={recipient.address}
                      onChange={handleInputChange}
                      className={formErrors.address ? 'input-error' : ''}
                    />
                    {formErrors.address && <p className="error-text">{formErrors.address}</p>}
                  </div>
                </section>

                

                <section className="order-notes">
                  <h2>訂單備註</h2>
                  <textarea
                    name="notes"
                    placeholder="有什麼想跟我們說的嗎？例如「管理員代收」、「請避開中午休息時間」等等～ (選填)"
                    value={notes}
                    onChange={handleNotesChange}
                  />
                </section>

                {/* 注意事項 */}
                <section className="important-notes">
                <h3>注意事項</h3>
                <ul>
                  <li>訂單成立後，將以Email通知您訂單成立。</li>
                  <li>付款完成後約1-3個工作日內出貨，如遇例假日則順延。</li>
                  <li>
                    目前暫不提供離島寄送服務，金門馬祖澎湖的朋友們搜哩啦！
                  </li>
                  <li>
                    為保障彼此之權益，收到您的訂單後仍保有決定是否接受訂單及出貨與否之權利。
                  </li>
                </ul>
              </section>
              </form>
            </div>

            <aside className="checkout-right">
              {orderDetails && (
                <div className="order-summary">
                  <h2>訂單摘要</h2>
                  {/* 這裡可以選擇性地顯示購物車內容摘要 */}
                  {orderDetails.cartItems && orderDetails.cartItems.length > 0 && (
                    <div style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee'}}>
                      <strong>購買商品 ({orderDetails.cartItems.length} 項):</strong>
                      <ul style={{listStyle: 'none', paddingLeft: '10px', fontSize: '0.9em'}}>
                        {orderDetails.cartItems.slice(0, 3).map(item => ( // 只顯示前3項，避免太長
                          <li key={item.productId}>- {item.name} x {item.quantity}</li>
                        ))}
                        {orderDetails.cartItems.length > 3 && <li>...等共 {orderDetails.cartItems.length} 件商品</li>}
                      </ul>
                    </div>
                  )}
                  <div className="summary-item">
                    <span>商品小計</span>
                    <span>NT ${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>運費</span>
                    <span>NT ${orderDetails.shippingFee.toFixed(2)}</span>
                  </div>
                  {orderDetails.discountAmount > 0 && (
                    <div className="summary-item discount">
                      <span>優惠折扣</span>
                      <span>- NT ${orderDetails.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="summary-item total">
                    <span>總金額</span>
                    <span>NT ${orderDetails.grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button" // 如果 form 在 checkout-left, 這個按鈕不在 form 內，所以用 type="button" 並在 onClick 呼叫 handleSubmit
                    className="btn-proceed-payment"
                    onClick={handleSubmit} // 點擊時觸發表單驗證和提交邏輯
                    disabled={loading} // 如果正在提交，就 disable 按鈕
                  >
                    {loading ? '處理中...' : '確認資料並前往付款 💳'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/cart')} // 返回購物車
                    style={{
                      background: '#6c757d', // bootstrap secondary color
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '5px',
                      width: '100%',
                      marginTop: '10px',
                      cursor: 'pointer',
                      fontSize: '1em'
                    }}
                  >
                    <i className="bi bi-arrow-left-circle"></i> 返回購物車修改
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}