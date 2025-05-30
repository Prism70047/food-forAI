'use client'

import React, { useState } from 'react'
import styles from '../styles/favorites-content.module.scss'
import { useAuth } from '@/hooks/auth-context'

const FavoritesContent = () => {
  const [activeTab, setActiveTab] = useState('recipe') // 預設顯示食譜

  return (
    <div className={styles.container}>
      <div className={styles.productFavoritesList}>
        <div className={styles.taskbar}>
          <div className={styles.favoritesBtn}>
            <div
              className={`${styles.btnRecipe} ${activeTab === 'recipe' ? styles.active : ''}`}
              onClick={() => setActiveTab('recipe')}
            >
              食譜
            </div>
            <div
              className={`${styles.btnIngredient} ${activeTab === 'ingredient' ? styles.active : ''}`}
              onClick={() => setActiveTab('ingredient')}
            >
              食材
            </div>
          </div>

          <div className={styles.searchInput}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/137a18afd6bf49c9985266999785670f/ce596acc94045c8a05e9fe58e5c71e8f6310f150?placeholderIfAbsent=true"
              className={styles.searchIcon}
              alt="Search"
            />
            <div className={styles.searchPlaceholder}>搜尋收藏內容</div>
          </div>

          <div className={styles.filter}>
            <div className={styles.filterText}>依收藏時間排序</div>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/137a18afd6bf49c9985266999785670f/e310986b0bf4fe2c9af9995e41f522cd2870650f?placeholderIfAbsent=true"
              className={styles.filterIcon}
              alt="Sort"
            />
          </div>
        </div>

        {/* 根據activeTab顯示對應的內容。ingredient：食材收藏、recipe：食譜收藏 */}
        {activeTab === 'ingredient' ? (
          <div className={styles.list}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>圖片</div>
              <div className={styles.headerCell}>品名</div>
              <div className={styles.headerCell}>品牌</div>
              <div className={styles.headerCell}>價格</div>
              <div className={styles.headerCell}>收藏</div>
              <div className={styles.headerCell}></div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.imageCell}>
                <div className={styles.productImage}></div>
              </div>
              <div className={styles.dataCell}>name</div>
              <div className={styles.dataCell}>Marvin</div>
              <div className={styles.dataCell}>$4,231.01</div>
              <div className={styles.dataCell}>26/04/2020</div>
              <div className={styles.actionCell}>
                <button className={styles.unfavoriteBtn}>取消收藏</button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {/* 食材收藏列表 */}
            {/* 可以根據需求顯示不同的內容 */}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesContent
