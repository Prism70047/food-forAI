'use client'

import React from 'react'
import Link from 'next/link'
import { Modal, Button } from 'react-bootstrap'
// 彈出視窗的卡片
import CartModal from '@/app/components/CartModal'
import SweetModal from '@/app/components/SweetModal'
import LoginModal from '@/app/components/LoginModal'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import * as ReactDOM from 'react-dom/client'
import { useSearchParams } from 'next/navigation'
import { BsBookmarkStarFill, BsBookmarkPlus } from '../../icons/icons'
import Bread from '@/app/components/Bread'
import FavoriteButton from '@/app/components/FavoriteButton'
import { API_SERVER } from '@/config/api-path'

import styles from '../../src/styles/page-styles/RecipeDetail.module.scss'
import {
  TbBowlSpoon,
  PiJarLabelBold,
  FaCartShopping,
  FaCartPlus,
  BiLike,
  IoIosAddCircle,
  IoIosArrowForward,
  TbHandFinger,
  IoIosArrowBack,
} from '../../icons/icons'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useEffect } from 'react'
// 特別注意，這個useAuth的鉤子一定要選auth-context.js的
import { useAuth } from '@/hooks/auth-context'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import FoodFeeBack from '../../components/FoodFeeBack'
import { LazyLoadImage } from 'react-lazy-load-image-component'

export default function RecipeDetailPage() {
  const [currentPage, setCurrentPage] = useState(0) // 當前頁數
  const [commentsPerPage, setCommentsPerPage] = useState(3) // 每頁顯示的評論數量
  // 動態調整每頁評論數量
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 991) {
        setCommentsPerPage(1)
      } else {
        setCommentsPerPage(3)
      }
    }
    handleResize() // 初始化時執行一次
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { auth } = useAuth() || {} // 使用 useAuth 鉤子獲取用戶信息

  // 這個狀態用來控制食材是否被選中
  const [selectedItems, setSelectedItems] = useState({})
  // 這個狀態用來控制調味料是否被選中
  const [selectedSeasonings, setSelectedSeasonings] = useState({})
  // 加入購物車的彈出視窗
  const [showCartModal, setShowCartModal] = useState(false)
  const [SuccessModal, setSuccessModal] = useState(false)
  const [cartModalMessage, setCartModalMessage] = useState('')
  // 用來控制收藏的狀態
  const [isFavorite, setIsFavorite] = useState(false)
  const [favorites, setFavorites] = useState({})
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)

  const [favoriteCount, setFavoriteCount] = useState(0) // 先設定初始值為 0
  // 按讚相關
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState({})
  const [likesLoaded, setLikesLoaded] = useState(false)
  // 2. 在組件內部宣告 router
  const router = useRouter()

  const params = useParams()
  const id = params?.id
  const fetcher = (url) => fetch(url).then((res) => res.json())

  const { data, error } = useSWR(
    id ? `http://localhost:3001/recipes/api/${id}` : null,
    fetcher
  )

  const isLoading = !data && !error
  const recipe = data?.data || {}

  // 假設API返回的步驟格式可能是這樣的
  // 步驟可能在 recipe.steps 或其他位置，這裡做一個預設值
  const steps = recipe.steps || []

  // 取得評論數據
  const comments = recipe.comments || []

  // 取的多少人收藏
  const fav = recipe.favorites || []

  // 取的多少人按讚
  const like = recipe.like_count || []

  // 計算當前頁的評論
  const startIndex = currentPage * commentsPerPage
  const endIndex = startIndex + commentsPerPage
  const currentComments = comments.slice(startIndex, endIndex)

  // 添加載入狀態檢查
  if (!id) {
    return <div>載入中...</div>
  }
  // 處理翻頁
  const handleNextPage = () => {
    if (endIndex < comments.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 取得相關食譜數據
  const relatedRecipes = recipe.related_recipes || []

  // 狀態：控制 FoodFeeBack 是否顯示
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false)

  // 3. 修改原本的 handleShowFeedbackModal 函數(這邊是未登入時會跳的訊息)
  const handleShowFeedbackModal = () => {
    if (!auth || !auth.token) {
      handleShowLoginModal()
      setCartModalMessage('請先登入才能留言喔！')
      return
    }

    // 使用 Sweetalert2 顯示表單
    Swal.fire({
      title: '撰寫食譜評論',
      html: '<div id="feedback-form-container"></div>',
      showCloseButton: true,
      showConfirmButton: false,
      width: '800px',
      // 禁用背景滾動條補償
      scrollbarPadding: false,
      // 允許背景點擊關閉
      allowOutsideClick: true,
      didOpen: () => {
        // 將 FoodFeeBack 組件渲染到指定容器
        const container = document.getElementById('feedback-form-container')
        const root = ReactDOM.createRoot(container)
        root.render(
          <FoodFeeBack
            recipeId={id} // 改用已經從 useParams 獲取的 id
            auth={auth}
            onSubmitSuccess={() => {
              Swal.close()
              // 可以在這裡加入提交成功後的處理邏輯，例如重新載入評論
              // 可以考慮加入: window.location.reload()
            }}
          />
        )
      },
    })
  }
  const handleCloseFeedbackModal = () => setIsFeedbackVisible(false)
  // 跟未登入點選流言按鈕有關的狀態
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 點擊按鈕顯示 FoodFeeBack
  const handleShowFeedback = () => {
    if (isFeedbackVisible) {
      setIsFeedbackVisible(false)
      return
    }
    // 如果已經顯示，則隱藏
    // 否則顯示 FoodFeeBack
    setIsFeedbackVisible(true)
  }

  const handleShowLoginModal = () => setShowLoginModal(true)
  const handleCloseLoginModal = () => setShowLoginModal(false)
  const handleGoToLogin = () => {
    router.push('/login') // 使用 router.push 進行導航
  }

  useEffect(() => {
    console.log('Updated Favorites State:', favorites) // 確認 favorites 狀態
  }, [favorites])

  // 取得收藏狀態
  useEffect(() => {
    // console.log('Authorization Token:', auth.token) // 檢查 token 是否正確

    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_SERVER}/recipes/api/favorite/get`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        const data = await response.json()
        console.log('Fetched Favorites:', data.favorites)

        setFavorites(data.favorites || {})
        setIsFavorite(data.favorites?.[id] || false) // 加入這行，設置當前食譜的收藏狀態
        setFavoritesLoaded(true)
      } catch (error) {
        console.error('載入收藏狀態失敗:', error)
      }
    }

    if (auth?.token) {
      fetchFavorites()
    }
  }, [auth])

  // 在 useEffect 中初始化收藏人數
  useEffect(() => {
    console.log('recipe:', recipe)
    if (recipe?.like_count !== undefined) {
      setFavoriteCount(recipe.favorites.count)
    }
  }, [recipe?.like_count])

  // 與讚有關的useEffect
  useEffect(() => {
    const fetchLikes = async () => {
      if (!auth?.token) return

      try {
        // 獲取使用者的按讚狀態
        const response = await fetch(`${API_SERVER}/recipes/api/likes/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        const data = await response.json()

        // 設置按讚狀態和數量
        if (data.success) {
          setIsLiked(data.isLiked)
          setLikeCount(data.likeCount)
        }
        setLikesLoaded(true)
      } catch (error) {
        console.error('載入按讚狀態失敗:', error)
      }
    }

    if (auth?.token) {
      fetchLikes()
    }
  }, [auth, id])

  // 初始化按讚數
  useEffect(() => {
    if (recipe?.likes?.count !== undefined) {
      setLikeCount(recipe.like_count)
    }
  }, [recipe?.likes?.count])

  // 處理收藏切換
  const toggleFavorite = (recipeId) => {
    const newFavoriteStatus = !favorites[recipeId]

    setFavorites((prev) => ({
      ...prev,
      [recipeId]: newFavoriteStatus,
    }))
    setIsFavorite(newFavoriteStatus)

    // 更新收藏數
    setFavoriteCount((prev) => (newFavoriteStatus ? prev + 1 : prev - 1))

    try {
      fetch(`${API_SERVER}/recipes/api/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          userId: auth.id,
          recipeId,
          isFavorite: newFavoriteStatus,
        }),
      })
    } catch (error) {
      console.error('更新收藏狀態失敗:', error)
      // 如果 API 呼叫失敗，回復原狀
      setFavorites((prev) => ({
        ...prev,
        [recipeId]: !newFavoriteStatus,
      }))
      setIsFavorite(!newFavoriteStatus)
      setFavoriteCount((prev) => (newFavoriteStatus ? prev - 1 : prev + 1))
    }
  }
  // 處理按讚的函數
  // const toggleLike = async (recipeId) => {
  //   if (!auth || !auth.token) {
  //     setShowLoginModal(true)
  //     return
  //   }

  //   try {
  //     const response = await fetch(`${API_SERVER}/recipes/api/likes/${id}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${auth.token}`,
  //       },
  //       body: JSON.stringify({
  //         userId: auth.id,
  //         recipeId,
  //       }),
  //     })

  //     if (!response.ok) {
  //       throw new Error('按讚失敗')
  //     }

  //     // 解析後端回傳的資料
  //     const result = await response.json()

  //     if (result.success) {
  //       // 使用後端回傳的讚數更新狀態
  //       setLikeCount(result.likeCount)
  //       setLikes((prev) => ({
  //         ...prev,
  //         [recipeId]: !prev[recipeId],
  //       }))
  //       setIsLiked(!isLiked)
  //     } else {
  //       throw new Error(result.message)
  //     }
  //   } catch (error) {
  //     console.error('更新按讚狀態失敗:', error)
  //     // 可以加入錯誤提示
  //     // setCartModalMessage(error.message)
  //     // setShowCartModal(true)
  //   }
  // }

  // 按讚
  const toggleLike = async (id) => {
    if (!auth || !auth.token) {
      setShowLoginModal(true)
      return
    }

    try {
      const response = await fetch(`${API_SERVER}/recipes/api/likes/id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          isLike: !isLiked, // 根據目前狀態切換
        }),
      })
      const data = await response.json()

      if (data.success) {
        // 更新讚數和按讚狀態
        setLikeCount(data.likeCount)
        setIsLiked(!isLiked)
      }
    } catch (error) {
      console.error('按讚失敗:', error)
    }
  }

  // 點擊按鈕添加食材至購物車
  // 假設購物車資料存儲在 localStorage 或透過 API 傳送
  // 這裡的 ingredients 是從 recipe.ingredients 中取得的

  // 舊的將食材加入購物車的函數(舊版)
  const handleAddToCart = async (ingredients) => {
    if (!ingredients || ingredients.length === 0) {
      alert('沒有可添加的食材！')
      return
    }

    if (!auth || !auth.token) {
      alert('請先登入以添加食材至購物車！')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/recipes/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`, // 假設需要用戶的 token
        },
        body: JSON.stringify({ ingredients }),
      })

      if (response.ok) {
        alert('已成功將食材添加至購物車！')
      } else {
        const errorData = await response.json()
        alert(`添加失敗：${errorData.message || '未知錯誤'}`)
      }
    } catch (error) {
      alert(`添加失敗：${error.message}`)
    }
  }
  // 點擊按鈕添加食材至購物車(新的)
  // 修改 handleConfirmCart 函數
  const handleConfirmCart = async () => {
    if (!auth || !auth.token) {
      setCartModalMessage('請先登入才能加入購物車！')
      setShowCartModal(true)
      return
    }
    // 取得所有被選中的食材的 product_id
    const selectedIngredientItems = recipe.ingredients
      .filter((_, index) => selectedItems[`condiment-${index}`])
      .map((item) => item.product_id)

    // 取得所有被選中的調味料的 product_id
    const selectedSeasoningItems = recipe.condiments
      .filter((_, index) => selectedSeasonings[`condiment-${index}`])
      .map((item) => item.product_id)

    // 如果都沒有選擇任何項目
    // 將原本的 alert 改為使用 CartModal
    if (
      selectedIngredientItems.length === 0 &&
      selectedSeasoningItems.length === 0
    ) {
      setCartModalMessage('請先選擇要加入購物車的食材或調味料！')
      setShowCartModal(true)
      return
    }

    // 合併所有選中的產品ID
    const allProductIds = [
      ...selectedIngredientItems,
      ...selectedSeasoningItems,
    ]

    // 新版的，產品ID一個一個給後端
    try {
      // 為每個產品發送個別的請求
      const promises = allProductIds.map((productId) =>
        fetch('http://localhost:3001/cart/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            productId: productId,
            quantityToAdd: 1,
          }),
        })
      )

      // 等待所有請求完成
      const responses = await Promise.all(promises)

      // 檢查所有請求是否都成功
      const results = await Promise.all(responses.map((r) => r.json()))

      // 如果所有請求都成功
      if (results.every((r) => r.success)) {
        setCartModalMessage('所有商品已成功加入購物車！')
        setSuccessModal(true)
      } else {
        const failedItems = results.filter((r) => !r.success)
        setCartModalMessage(
          `部分商品加入失敗：${failedItems.map((r) => r.message).join('\n')}`
        )
        setShowCartModal(true)
      }
    } catch (error) {
      setCartModalMessage(`加入購物車時發生錯誤：${error.message}`)
      setShowCartModal(true)
    }

    //  舊版的，原本是寫成多個產品ID打包起來送給後端，但目前後端是寫成產品ID一個一個接收
    // try {
    //   // const response = await fetch('http://localhost:3001/recipes/api/add', {
    //   const response = await fetch('http://localhost:3001/cart/api/items', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${auth.token}`, // 假設需要用戶的 token
    //     },
    //     body: JSON.stringify({
    //       ingredients: selectedIngredientItems,
    //       seasonings: selectedSeasoningItems,
    //       recipeId: id,
    //       userId: auth.id,
    //       productId: allProductIds,
    //       quantityToAdd: 1, // 預設數量為1，您可以根據需求調整
    //     }),
    //   })

    //   if (response.ok) {
    //     alert('已成功添加至購物車！')
    //   } else {
    //     const errorData = await response.json()
    //     alert(`添加失敗：${errorData.message || '未知錯誤'}`)
    //   }
    // } catch (error) {
    //   alert(`添加失敗：${error.message}`)
    // }
  }

  return (
    <div className={styles.container}>
      {/* 版頭 Start */}
      <div className={styles.heroSection}>
        <div>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
        </div>
        <img
          src={recipe.image ? `${recipe.image}` : '讀取中...'}
          alt="Recipe hero image"
        />
      </div>
      {/* 版頭 End */}
      <Bread
        items={[
          { text: '首頁', href: '/' },
          { text: '食譜搜尋', href: '/recipes-landing' },
          { text: '食譜列表', href: '/recipes-landing/list' },
          { text: '食譜頁面' },
        ]}
      />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>{`已有${favoriteCount}人收藏!!`}</div>
        {isLoading && !favoritesLoaded ? (
          <div className={styles.loading}>載入中...</div>
        ) : (
          <div style={{ backgroundColor: 'tomato', width: '100px' }}>
            <FavoriteButton
              recipeId={id}
              initialFavorite={favorites[id]}
              onFavoriteToggle={toggleFavorite}
              className={styles.recipeFavoriteButton}
            />
          </div>
        )}

        <div>{`已有${like}人按讚!!`}</div>
        {/* <div>{likeCount}</div> */}
        {isLoading && !likesLoaded ? (
          <div className={styles.loading}>載入中...</div>
        ) : (
          <button
            onClick={() => toggleLike(id)}
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          >
            <BiLike size={24} />
          </button>
        )}
      </div>
      {/* <button
        alt={isFavorite ? '已收藏' : '加入收藏'}
        onClick={handleFavoriteClick}
        style={{ cursor: 'pointer' }}
      >
        {isFavorite ? <BsBookmarkStarFill /> : <BsBookmarkPlus />}
      </button> */}

      {/* 材料選單 Start */}
      <div className={styles.ingredientsSection}>
        <div className={styles.ingredientCard}>
          <div className={styles.cardBody}>
            <h2>食材</h2>
            <div className={styles.cardList}>
              {recipe.ingredients ? (
                recipe.ingredients.map((ingredient, index) => (
                  <React.Fragment key={index}>
                    <div>
                      {/* •{ingredient} */}• {ingredient.name}{' '}
                      {ingredient.quantity} {ingredient.unit}
                      {/* <button className={styles.cartIconBefore}>
                        <IoIosAddCircle className={styles.cartIconAdd} />
                      </button> */}
                      <button
                        className={
                          selectedItems[`condiment-${index}`]
                            ? styles.cartIconAfter
                            : styles.cartIconBefore
                        }
                        onClick={() => {
                          setSelectedItems((prev) => ({
                            ...prev,
                            [`condiment-${index}`]: !prev[`condiment-${index}`],
                          }))
                        }}
                      >
                        {selectedItems[`condiment-${index}`] ? (
                          <FaCartShopping className={styles.cartIcon} />
                        ) : (
                          <IoIosAddCircle className={styles.cartIconAdd} />
                        )}
                      </button>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <li>
                    短米 300 克 <IoIosAddCircle />
                  </li>

                  <li>海鮮 500 克 (蝦、魷魚、貽貝)</li>
                  <li>洋蔥 1 顆 (切碎)</li>
                  <li>大蒜 3 瓣 (切碎)</li>
                </>
              )}
            </div>
          </div>

          <div className={styles.cardIcon}>
            <TbBowlSpoon />
          </div>
        </div>
        <div className={styles.ingredientCard}>
          <div className={styles.cardBody}>
            <h2>調味料</h2>
            <div className={styles.cardList}>
              {recipe.ingredients ? (
                recipe.condiments.map((seasoning, index) => (
                  <React.Fragment key={index}>
                    <div>
                      • {seasoning.name} {seasoning.quantity} {seasoning.unit}
                      <button
                        className={
                          selectedSeasonings[`condiment-${index}`]
                            ? styles.cartIconAfter
                            : styles.cartIconBefore
                        }
                        onClick={() => {
                          setSelectedSeasonings((prev) => ({
                            ...prev,
                            [`condiment-${index}`]: !prev[`condiment-${index}`],
                          }))
                        }}
                      >
                        {selectedSeasonings[`condiment-${index}`] ? (
                          <FaCartShopping className={styles.cartIcon} />
                        ) : (
                          <IoIosAddCircle className={styles.cartIconAdd} />
                        )}
                      </button>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <>
                  •魚高湯 600 毫升
                  <br />
                  •白酒 100 毫升 <br />
                  •奶油 40 克<br />
                  <span className={styles.seasoningHighlight}>
                    •帕馬森起司 50克 (磨碎)
                  </span>
                </>
              )}
            </div>
          </div>
          <button className={styles.cardCheck} onClick={handleConfirmCart}>
            <h2>
              <TbHandFinger />
              &nbsp;確認
            </h2>
          </button>

          {/* 加入 SweetModal 組件 */}
          <SweetModal
            show={showCartModal}
            onHide={() => setShowCartModal(false)}
            title="購物車訊息"
            message={cartModalMessage}
            icon="info"
          />
          {/* 加入 SweetModal 組件 (打勾的) */}
          <SweetModal
            show={SuccessModal}
            onHide={() => setShowCartModal(false)}
            title="購物車訊息"
            message={cartModalMessage}
            icon="success"
          />
          <div className={styles.cardIcon}>
            <PiJarLabelBold />
          </div>
        </div>
      </div>
      {/* 材料選單 End */}

      {/* Steps Section - 動態生成步驟 */}
      <div className={styles.stepsSection}>
        <img src="/images/design/paper-top.svg" alt="Steps header" />
        <div className={styles.stepsContainer}>
          <div>
            {isLoading ? (
              <div>正在載入步驟...</div>
            ) : error ? (
              <div>載入步驟時發生錯誤</div>
            ) : steps && steps.length > 0 ? (
              steps.map((step, index) => (
                <div className={styles.stepItem} key={index}>
                  <div
                    className={
                      index % 2 === 0
                        ? styles.stepNumberDark
                        : styles.stepNumberLight
                    }
                  >
                    <div className={styles.stepNumberText}>
                      <h3>步</h3>
                      <h3>驟</h3>
                    </div>
                    <h3 className={styles.stepNumberValue}>{index + 1}</h3>
                  </div>
                  <div className={styles.stepDescription}>
                    {step.description || step}。
                  </div>
                </div>
              ))
            ) : (
              // 備用的靜態步驟，當API沒有返回步驟時顯示
              <>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumberDark}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>1</div>
                  </div>
                  <div className={styles.stepDescription}>
                    蘑菇和洋蔥切碎，準備好所有材料。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberLight}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>2</div>
                  </div>
                  <div className={styles.stepDescription}>
                    在鍋中融化奶油，加入洋蔥炒至透明。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberDark}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>3</div>
                  </div>
                  <div className={styles.stepDescription}>
                    加入蘑菇繼續炒至水分蒸發，香氣四溢。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberLight}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>4</div>
                  </div>
                  <div className={styles.stepDescription}>
                    撒入麵粉炒至無粉味。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberDark}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>5</div>
                  </div>
                  <div className={styles.stepDescription}>
                    慢慢加入雞高湯，不斷攪拌至湯變得濃稠。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberLight}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>6</div>
                  </div>
                  <div className={styles.stepDescription}>
                    小火煮15分鐘後加入鮮奶油。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberDark}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>7</div>
                  </div>
                  <div className={styles.stepDescription}>
                    用攪拌機打成細滑濃湯，最後加入松露油調味。
                  </div>
                </div>

                <div className={styles.stepItem}>
                  <div className={styles.stepNumberLight}>
                    <div className={styles.stepNumberText}>
                      <div>步</div>
                      <div>驟</div>
                    </div>
                    <div className={styles.stepNumberValue}>8</div>
                  </div>
                  <div className={styles.stepDescription}>
                    上桌前在每碗湯上放上切片松露裝飾。
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 美食笑尖兵 */}
      <div className={styles.chefContainer}>
        <div className={styles.chefCard}>
          <img src="/images/recipes-img/chef.webp" alt="美食笑尖兵" />
          <div className={styles.chefText}>
            <h2>🦸美食笑尖兵</h2>

            <p>
              歡迎來到<b> FOOD ┃今仔日食飽未 </b>的美味世界！🎉🎉🎉
            </p>
            <p>
              我們是一群由熱愛料理的夥伴組成的團隊，以「笑」為調味，用創意烹製各式各樣的美食饗宴。
              <b>
                我們的目標很簡單：透過輕鬆有趣的方式，分享多元豐富的料理內容
              </b>
              ，讓每一位熱愛生活、享受美食的朋友，都能在這裡找到屬於自己的味蕾驚喜。
            </p>
            <p>
              <b>🦸美食笑尖兵</b>
              的特色在於對異國料理的熱情探索、對充滿人情味的手尾菜的溫暖傳承，以及對精緻甜點的甜蜜創造。我們相信，料理不只是滿足口腹之慾，更是一種文化交流、情感連結和療癒心靈的方式。
            </p>
            <p>
              🔥🔥🔥<b>趕快加入我們的行列，讓每一餐都充滿驚喜與歡樂吧！</b>
              🔥🔥🔥
            </p>
          </div>
        </div>
      </div>

      {/* user_feedbacks - 動態生成評論 */}
      <div className={styles.commentsSection}>
        <div className={styles.commentsContainer}>
          <Button
            variant="primary"
            onClick={handleShowFeedbackModal}
            className={styles.addCommentButton}
          >
            <h2>添加留言</h2>
          </Button>

          {/* 5. React Bootstrap Modal  這裡是食譜評論的彈出視窗
        。然後可以在SCSS當中自訂CSS樣式 。目前應該需調整*/}

          {/* 登入提示 Modal */}
          {/* <Modal
            show={showLoginModal}
            onHide={handleCloseLoginModal}
            centered
            size="lg" // 可設定 'sm', 'lg', 'xl'
          >
            <Modal.Header closeButton>
              <Modal.Title>請先登入</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>需要登入才能撰寫評論喔！</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseLoginModal}>
                關閉
              </Button>
              <Button variant="primary" onClick={handleGoToLogin}>
                前往登入
              </Button>
            </Modal.Footer>
          </Modal> */}
          {/* 新的登入提示 */}
          <LoginModal
            show={showLoginModal}
            onHide={() => setShowLoginModal(false)}
            message={cartModalMessage}
            onNavigateToLogin={() => {
              setShowLoginModal(false)
              router.push('/login')
            }}
          />

          <div>
            {/* 左箭頭按鈕 */}

            <div className={styles.commentsList01}>
              {/* 左箭頭按鈕 */}
              <button
                onClick={handlePrevPage}
                // 第一頁禁用：disabled={currentPage === 0}
                disabled={currentPage === 0}
              >
                <IoIosArrowBack />
              </button>
              <div className={styles.commentsList}>
                {isLoading ? (
                  <div>正在載入評論...</div>
                ) : error ? (
                  <div>載入評論時發生錯誤</div>
                ) : currentComments && currentComments.length > 0 ? (
                  currentComments.map((comment, index) => (
                    <div className={styles.commentCard} key={index}>
                      <div>
                        <img
                          src={comment.userAvatar || `/images/user/default.jpg`}
                          alt="User avatar"
                          onError={(e) => {
                            if (!e.target.dataset.fallback) {
                              e.target.dataset.fallback = true // 標記已經使用過 fallback
                              e.target.src = `/images/recipes/user${(index % 2) + 1}.png`
                            }
                          }}
                        />
                        <div className={styles.userInfo}>
                          <button className={styles.buttonBiLike01}>
                            <BiLike />
                          </button>
                          {/* <button className={styles.buttonBiLike02}>
                          <BiLike />
                        </button> */}
                          <h3>{comment.username || '匿名用戶'}</h3>
                          <p>{comment.created_at || '未知日期'}</p>
                        </div>
                      </div>
                      <div className={styles.commentContent}>
                        <h2>{comment.title || '無標題'}</h2>
                        <p>{comment.context || comment.text || '無評論內容'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  // 備用的靜態評論，當API沒有返回評論時顯示
                  <>
                    <div className={styles.commentCard}>
                      <div>
                        {/* 因為這一塊是假設沒人留言的情況下，所以先註解掉 */}
                        {/* <img
                    src={`/images/user/default.jpg`}
                    className={styles.userAvatar}
                    alt="User avatar"
                    onError={(e) => {
                      if (!e.target.dataset.fallback) {
                        e.target.dataset.fallback = true // 標記已經使用過 fallback
                        e.target.src = `/images/recipes/user${(index % 2) + 1}.png`
                      }
                    }}
                  /> */}
                        <div className={styles.userInfo}>
                          <div>
                            <div>
                              <h2>{'目前這個食譜尚未有人留言'}</h2>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.commentContent}>
                        <div className={styles.commentText}>
                          {'目前這個食譜尚未有人留言'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* 右箭頭按鈕 */}
              <button
                className={styles.arrowButton}
                onClick={handleNextPage}
                disabled={endIndex >= comments.length} // 最後一頁禁用
              >
                <IoIosArrowForward />
              </button>
              {/* 這邊是原本預計要放的右箭頭，也先註解掉用別的替代 */}
              {/* <img
            src="/images/recipes/user-avatar-right.png"
            className={styles.userAvatarRight}
            alt="User avatar"
          /> */}
            </div>
          </div>
        </div>
      </div>
      {/* FoodFeeBack 區塊 */}
      {/* {isFeedbackVisible && <FoodFeeBack />} */}

      {/* Related Recipes Section - 動態生成相關食譜 */}
      <div className={styles.relatedRecipesSection}>
        <div>
          <h2>你可能會喜歡</h2>
          <div className={styles.relatedRecipesGrid}>
            {isLoading ? (
              <h3>正在載入相關食譜...</h3>
            ) : error ? (
              <h3>載入相關食譜時發生錯誤</h3>
            ) : relatedRecipes && relatedRecipes.length > 0 ? (
              relatedRecipes.map((relatedRecipe, index) => (
                <Link
                  href={`/recipes/${relatedRecipe.related_recipe_id}`}
                  key={relatedRecipe.related_recipe_id || index}
                  className={styles.relatedRecipeCard}
                >
                  {/* img先註解掉，不然會一直無限跟後端發API請求 */}
                  <div className={styles.relatedRecipeImage}>
                    <img
                      src={
                        relatedRecipe.image ||
                        `/images/recipes/related${(index % 6) + 1}.jpg`
                      }
                      alt={relatedRecipe.title || '相關食譜'}
                      onError={(e) => {
                        if (!e.target.dataset.fallback) {
                          e.target.dataset.fallback = true // 標記已經使用過 fallback
                          e.target.src = `/images/recipes/related${(index % 6) + 1}.jpg`
                        }
                      }}
                    />
                  </div>
                  <h2>{relatedRecipe.title || '未命名食譜'}</h2>
                </Link>
              ))
            ) : (
              // 備用的靜態相關食譜，當API沒有返回數據時顯示
              <>
                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related1.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>希臘沙拉</div>
                </div>

                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related2.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>
                    墨西哥玉沙拉米餅
                  </div>
                </div>

                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related3.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>
                    義式焗烤千層麵
                  </div>
                </div>

                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related4.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>
                    巧克力熔岩蛋糕
                  </div>
                </div>

                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related5.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>台式滷肉飯</div>
                </div>

                <div className={styles.relatedRecipeCard}>
                  <img
                    src="/images/recipes/related6.jpg"
                    className={styles.relatedRecipeImage}
                    alt="Related recipe"
                  />
                  <div className={styles.relatedRecipeTitle}>泰式綠咖哩雞</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* sticker */}
      <div className={styles.sticker}>
        <LazyLoadImage
          src="/images/design/sticker-1.svg"
          delayTime={300}
          className={styles.sticker1}
          alt="蔬菜"
        />
        <LazyLoadImage
          src="/images/design/sticker-2.svg"
          delayTime={300}
          className={styles.sticker2}
          alt="橄欖油"
        />
        <LazyLoadImage
          src="/images/design/sticker-3.svg"
          delayTime={300}
          className={styles.sticker3}
          alt="調味罐"
        />
        <LazyLoadImage
          src="/images/design/sticker-5.svg"
          delayTime={300}
          className={styles.sticker5}
          alt="砧板"
        />
      </div>
    </div>
  )
}
