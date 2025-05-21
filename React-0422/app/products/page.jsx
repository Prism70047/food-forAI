'use client'

import React, { useState, useEffect } from 'react'
import styles from '../src/styles/page-styles/ProductList.module.scss'
import { ProductCard } from '../components/ProductCard'
import { GrPrevious, IoIosArrowBack } from '../icons/icons' // 使用 react-icons 套件

// 在檔案開頭加入 API 基礎網址常數
// 這個很棒
const API_BASE_URL = 'http://localhost:3001/products' // 根據實際情況修改

// 新增: API 請求函數
const fetchAllProducts = async (page, limit = 12) => {
  const response = await fetch(
    `${API_BASE_URL}/api/products?page=${page}&limit=${limit}`
  )
  if (!response.ok) throw new Error('取得商品列表失敗')
  return response.json()
}

const fetchFilteredProducts = async (params) => {
  const response = await fetch(
    `${API_BASE_URL}/api/products/filter?${params.toString()}`
  )
  if (!response.ok) throw new Error('篩選商品失敗')
  return response.json()
}

export default function ProductListPage() {
  //  State 狀態管理
  const [products, setProducts] = useState([]) // 顯示中的產品資料
  const [loading, setLoading] = useState(true) // 是否在載入中
  const [currentPage, setCurrentPage] = useState(1) // 目前頁碼 (初始值改為 1，因為有分類和搜尋時通常從第一頁開始)
  const [totalPages, setTotalPages] = useState(1) // 總頁數（預設改為 1）
  const [activeCategory, setActiveCategory] = useState('本周熱銷') // 目前分類
  const [sortByPrice, setSortByPrice] = useState(null) // 是否以價格排序，null 表示不排序
  const [searchTerm, setSearchTerm] = useState('') // 新增：搜尋關鍵字狀態
  const [searchInput, setSearchInput] = useState('') // 新增：搜尋輸入值狀態
  const [minPriceInput, setMinPriceInput] = useState('') // 新增：價格輸入暫存
  const [maxPriceInput, setMaxPriceInput] = useState('') // 新增：價格輸入暫存
  const [minPrice, setMinPrice] = useState('') // 實際用於查詢的價格
  const [maxPrice, setMaxPrice] = useState('') // 實際用於查詢的價格
  const [priceFilter, setPriceFilter] = useState({ min: null, max: null })
  const [error, setError] = useState(null) // 新增：錯誤狀態
  //  當頁碼、分類、排序條件、搜尋關鍵字改變時，重新取得產品資料
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true)
      try {
        // 判斷是否需要篩選
        const hasFilters =
          activeCategory !== '本周熱銷' ||
          searchTerm ||
          minPrice ||
          maxPrice ||
          sortByPrice !== null

        let result
        if (hasFilters) {
          const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: '15',
            category: activeCategory !== '本周熱銷' ? activeCategory : '',
            search: searchTerm,
            sort: sortByPrice ? 'price_desc' : 'price_asc',
            minPrice,
            maxPrice,
          })
          result = await fetchFilteredProducts(params)
        } else {
          result = await fetchAllProducts(currentPage)
        }

        if (result.success) {
          setProducts(result.rows)
          setTotalPages(result.totalPages)
        }
      } catch (error) {
        console.error('取得商品失敗:', error)
        setProducts([])
        setTotalPages(1)
        setError('取得商品失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [currentPage, activeCategory, sortByPrice, searchTerm, minPrice, maxPrice]) // 使用實際查詢價格，而不是輸入值

  // 修改分類切換函數，清除價格查詢
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setCurrentPage(1)
    setSearchTerm('')
    setSearchInput('')
    setMinPrice('')
    setMaxPrice('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setSortByPrice(null) // 清除價格排序
  }

  const getArrowIcon = () => {
    if (sortByPrice === null) return '⭥'
    if (sortByPrice === true) return '⭣'
    if (sortByPrice === false) return '⭡'
  }

  //  切換價格排序
  const togglePriceSorting = () => {
    setSortByPrice(!sortByPrice)
    setCurrentPage(1) //  切換排序時，重置到第一頁
  }

  // 修改：處理搜尋輸入
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value)
  }

  // 新增：處理搜尋按鈕點擊
  const handleSearch = () => {
    setSearchTerm(searchInput)
    setCurrentPage(1)
    setActiveCategory('本周熱銷')
    setMinPrice('')
    setMaxPrice('')
  }

  // 新增：處理按下 Enter 鍵搜尋
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  // 修改處理價格輸入的函數
  const handlePriceInput = (type, value) => {
    // 確保輸入為數字
    const numberValue = value.replace(/[^0-9]/g, '')
    if (type === 'min') {
      setMinPriceInput(numberValue)
    } else {
      setMaxPriceInput(numberValue)
    }
  }

  // 修改價格查詢函數
  const handlePriceSearch = () => {
    setMinPrice(minPriceInput) // 設定實際查詢用的價格
    setMaxPrice(maxPriceInput)
    setCurrentPage(1)
    setSearchTerm('')
    setSearchInput('')
    setActiveCategory('本周熱銷')
  }

  //  分頁控制：前後頁或指定頁碼
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  //  用於產生分頁按鈕的輔助函數 (可選，讓分頁更動態)
  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // 最多顯示多少個頁碼按鈕
    let startPage, endPage

    if (totalPages <= maxPagesToShow) {
      startPage = 1
      endPage = totalPages
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2)
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1
        endPage = maxPagesToShow
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1
        endPage = totalPages
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage
        endPage = currentPage + maxPagesAfterCurrentPage
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <div className={styles.paginationItem} key={i}>
          <button
            className={`${styles.paginationButton} ${currentPage === i ? styles.paginationButtonActive : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </div>
      )
    }
    return pageNumbers
  }

  return (
    <div className={styles.container}>
      {/* 篩選區塊 */}
      <div className={styles.filterSection}>
        <div className={styles.priceSearchContainer}>
          {/* 搜尋商品 */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="搜尋商品..."
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className={styles.searchBar}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              <h3>搜尋</h3>
            </button>
          </div>

          {/* 新增：價格區間查詢 */}
          <div className={styles.priceFilterContainer}>
            <input
              type="text"
              placeholder="最低價格"
              value={minPrice}
              onChange={(e) => handlePriceInput('min', e.target.value)}
              className={styles.priceInput}
            />
            ~
            <input
              type="text"
              placeholder="最高價格"
              value={maxPrice}
              onChange={(e) => handlePriceInput('max', e.target.value)}
              className={styles.priceInput}
            />
            <button
              onClick={handlePriceSearch}
              className={styles.priceSearchButton}
            >
              <h3>價格查詢</h3>
            </button>
          </div>
        </div>

        {/* 分類按鈕（動態 active 樣式） */}
        <div className={styles.filterContainer}>
          <button
            className={`${activeCategory === '本周熱銷' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('本周熱銷')}
          >
            <h3>熱門商品</h3>
          </button>
          <button
            className={` ${activeCategory === '蔬菜類' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('蔬菜類')}
          >
            <h3>蔬菜類</h3>
          </button>
          <button
            className={` ${activeCategory === '肉類' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('肉類')}
          >
            <h3>肉類</h3>
          </button>
          <button
            className={` ${activeCategory === '海鮮類' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('海鮮類')}
          >
            <h3>海鮮類</h3>
          </button>
          <button
            className={`${activeCategory === '調味品' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('調味品')}
          >
            <h3>調味品</h3>
          </button>
        </div>

        {/* 價格排序 */}
        <button className={styles.priceFilter} onClick={togglePriceSorting}>
          <h3>價格 {getArrowIcon()}</h3> {/* 新增：排序指示 */}
        </button>
      </div>

      {/* 商品區塊 */}
      <div className={styles.productSection}>
        <div className={styles.productGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>載入商品中...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>重新整理</button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>沒有符合條件的商品</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image || '/placeholder.jpg'}
                brand={product.brand}
                price={product.price}
                original_price={product.original_price}
                initialFavorite={false}
              />
            ))
          )}
        </div>
      </div>

      {/* 分頁區塊 */}
      {totalPages > 0 &&
        products &&
        products.length > 0 && ( // 修改：只有在有商品且總頁數大於0時顯示分頁
          <div className={styles.paginationSection}>
            <div className={styles.pagination}>
              {/* 上一頁 */}
              <h2
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ cursor: currentPage > 1 ? 'pointer' : 'not-allowed' }}
              >
                <IoIosArrowBack />
              </h2>

              {/* 動態頁碼按鈕 (使用輔助函數) */}
              {renderPageNumbers()}

              {/* 下一頁 */}
              <h2
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  cursor: currentPage < totalPages ? 'pointer' : 'not-allowed',
                }}
              >
                <IoIosArrowBack />
              </h2>
            </div>
          </div>
        )}
    </div>
  )
}
