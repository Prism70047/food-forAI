'use client'

import React from 'react'
import Link from 'next/link'
import { Modal, Button } from 'react-bootstrap'

import styles from '../../src/styles/page-styles/RecipeDetail.module.scss'
import {
  TbBowlSpoon,
  PiJarLabelBold,
  FaCartShopping,
  FaCartPlus,
  BiLike,
  IoIosAddCircle,
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
  const commentsPerPage = 3 // 每頁顯示的評論數量
  const { auth } = useAuth() || {} // 使用 useAuth 鉤子獲取用戶信息
  // 這個狀態用來控制食材是否被選中
  const [selectedItems, setSelectedItems] = useState({})
  // 這個狀態用來控制調味料是否被選中
  const [selectedSeasonings, setSelectedSeasonings] = useState({})
  // 2. 在組件內部宣告 router
  const router = useRouter()

  const params = useParams()
  const id = params.id
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

  // 計算當前頁的評論
  const startIndex = currentPage * commentsPerPage
  const endIndex = startIndex + commentsPerPage
  const currentComments = comments.slice(startIndex, endIndex)

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

  // 3. 修改原本的 handleShowFeedbackModal 函數
  const handleShowFeedbackModal = () => {
    if (!auth || !auth.token) {
      handleShowLoginModal()
      return
    }
    setIsFeedbackVisible(true)
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

  // 點擊按鈕添加食材至購物車
  // 假設購物車資料存儲在 localStorage 或透過 API 傳送
  // 這裡的 ingredients 是從 recipe.ingredients 中取得的

  // 舊的將食材加入購物車的函數
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
  const handleConfirmCart = async () => {
    if (!auth || !auth.token) {
      alert('請先登入才能加入購物車！')
      return
    }

    // 取得所有被選中的食材
    const selectedIngredientItems = recipe.ingredients.filter(
      (_, index) => selectedItems[`condiment-${index}`]
    )

    // 取得所有被選中的調味料
    const selectedSeasoningItems = recipe.condiments.filter(
      (_, index) => selectedSeasonings[`condiment-${index}`]
    )

    // 如果都沒有選擇任何項目
    if (
      selectedIngredientItems.length === 0 &&
      selectedSeasoningItems.length === 0
    ) {
      alert('請先選擇要加入購物車的食材或調味料！')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/recipes/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`, // 假設需要用戶的 token
        },
        body: JSON.stringify({
          ingredients: selectedIngredientItems,
          seasonings: selectedSeasoningItems,
          recipeId: id,
        }),
      })

      if (response.ok) {
        alert('已成功添加至購物車！')
      } else {
        const errorData = await response.json()
        alert(`添加失敗：${errorData.message || '未知錯誤'}`)
      }
    } catch (error) {
      alert(`添加失敗：${error.message}`)
    }
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
          <button className={styles.cardCheck}>
            <h2>
              <TbHandFinger />
              &nbsp;確認
            </h2>
          </button>
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
          <Modal
            show={isFeedbackVisible}
            onHide={handleCloseFeedbackModal}
            centered
            size="lg" // 可設定 'sm', 'lg', 'xl'
          >
            <Modal.Header closeButton>
              <Modal.Title>撰寫食譜評論</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* 6. 放入您的 FoodFeeBack 元件 */}
              <FoodFeeBack />
              {/* 您可能需要傳遞一些 props 給 FoodFeeBack，例如關閉 modal 的函數 */}
              <FoodFeeBack onFormSubmit={handleCloseFeedbackModal} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseFeedbackModal}>
                關閉
              </Button>
              {/* 如果 FoodFeeBack 內部有自己的提交按鈕，這裡可能不需要額外的儲存按鈕 */}
              {/* <Button variant="primary" onClick={() => { /* 觸發表單提交邏輯 *\/; handleCloseFeedbackModal(); }}>
            提交評論
          </Button> */}
            </Modal.Footer>
          </Modal>

          {/* 登入提示 Modal */}
          <Modal
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
          </Modal>

          <div>
            {/* 左箭頭按鈕 */}

            <div className={styles.commentsList01}>
              {/* 左箭頭按鈕 */}
              <button
                className={styles.arrowButton}
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
                      <div className={styles.commentUser}>
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
                          <div className={styles.userContent}>
                            <div className={styles.userName}>
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
                    {/* 下面是原本的預設食譜評論卡片樣式 */}
                    {/* <div className={styles.commentCard}>
                <div className={styles.commentUser}>
                  <img
                    src="/images/recipes/user1.png"
                    className={styles.userAvatar}
                    alt="User avatar"
                  />
                  <div className={styles.userInfo}>
                    
                    <div className={styles.userContent}>
                      <div className={styles.userName}>李淑芬</div>
                      <div className={styles.commentDate}>2025-02-24 10:15</div>
                    </div>
                  </div>
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentTitle}>
                    味道不錯，但食材稍微貴了一點~
                  </div>
                  <div className={styles.commentText}>
                    我的驕傲被爹媽看出來了，我沒在收假最後一天才寫完作業，我知道，這是我的我驕傲，也是其他小友的恨。
                  </div>
                </div>
              </div>

              <div className={styles.commentCard}>
                <div className={styles.commentUser}>
                  <img
                    src="/images/recipes/user2.png"
                    className={styles.userAvatar}
                    alt="User avatar"
                  />
                  <div className={styles.userInfo}>
                    
                    <div className={styles.userContent}>
                      <div className={styles.userName}>陳志明</div>
                      <div className={styles.commentDate}>2025-02-17 12:45</div>
                    </div>
                  </div>
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentTitle}>
                    覺得還可以，已加購物車買來試試
                  </div>
                  <div className={styles.commentText}>
                    一個不成熟男子的標誌是他願意為某種事業英勇地死去，一個成熟男子的標誌是他願意為某種事業卑賤地活著。
                  </div>
                </div>
              </div> */}
                  </>
                )}
              </div>
              {/* 右箭頭按鈕 */}
              <button
                className={styles.arrowButton}
                onClick={handleNextPage}
                disabled={endIndex >= comments.length} // 最後一頁禁用
              >
                <IoIosArrowBack />
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
      {isFeedbackVisible && <FoodFeeBack />}

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
  )
}
