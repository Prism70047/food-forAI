'use client'

import React from 'react'
import styles from './src/styles/page-styles/HomePage.module.scss'
import Link from 'next/link'
import Image from 'next/image'
// import {  } from './icons/icons
import SemicircleCarousel from './components/SemicircleCarousel'
export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <SemicircleCarousel />
      <div className={styles.featuredSection}>
        <div className={styles.featuredGrid}>
          <div className={styles.featuredLarge}>
            <Image
              src="/images/featured-1.jpg"
              alt="Featured content"
              width={600}
              height={650}
              className={styles.featuredImage}
            />
            <div className={styles.imageOverlay}>
              <div className={styles.categoryTag}>生活</div>
              <div className={styles.imageTitle}>全新開幕，話題新餐廳!!</div>
            </div>
          </div>
          <div className={styles.featuredSmallContainer}>
            <div className={styles.featuredSmall}>
              <Image
                src="/images/featured-2.jpg"
                alt="Featured content"
                width={600}
                height={320}
                className={styles.featuredImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>健康</div>
                <div className={styles.imageTitle}>由水果所組成的健康吃法</div>
              </div>
            </div>
            <div className={styles.featuredSmall}>
              <Image
                src="/images/featured-3.jpg"
                alt="Featured content"
                width={600}
                height={320}
                className={styles.featuredImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>周末時光</div>
                <div className={styles.imageTitle}>
                  與朋友周末相聚時的好選擇!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentColumn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>大廚上菜囉!</h2>
              <Link href="/recipes-landing" className={styles.moreLink}>
                More
              </Link>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/recipe-1.jpg"
                alt="Recipe"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>名廚上菜</div>
                <div className={styles.imageTitle}>
                  在家也能輕鬆做的四種冷麵
                </div>
              </div>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/recipe-2.jpg"
                alt="Recipe"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>名廚上菜</div>
                <div className={styles.imageTitle}>牛肉西吃的三種吃法</div>
              </div>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/recipe-3.jpg"
                alt="Recipe"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>名廚上菜</div>
                <div className={styles.imageTitle}>炭烤牛肋排</div>
              </div>
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>生活專區</h2>
              <Link href="/lifestyle" className={styles.moreLink}>
                More
              </Link>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/lifestyle-1.jpg"
                alt="Lifestyle"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>生活</div>
                <div className={styles.imageTitle}>全新開幕的話題蛋糕店!!</div>
              </div>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/lifestyle-2.jpg"
                alt="Lifestyle"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>生活</div>
                <div className={styles.imageTitle}>草莓季來襲</div>
              </div>
            </div>

            <div className={styles.recipeItem}>
              <Image
                src="/images/lifestyle-3.jpg"
                alt="Lifestyle"
                width={600}
                height={225}
                className={styles.recipeImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.categoryTag}>生活</div>
                <div className={styles.imageTitle}>清爽夏海宴席</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recipeCardsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>種類名稱</h2>
          <Link href="/recipes-landing/list" className={styles.moreLink}>
            More
          </Link>
        </div>

        <div className={styles.recipeCardsGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
            <div key={index} className={styles.recipeCard}>
              <div className={styles.recipeCardImageWrapper}>
                <Image
                  src={`/images/recipe-card-${index}.jpg`}
                  alt="Recipe"
                  width={320}
                  height={177}
                  className={styles.recipeCardImage}
                />
              </div>
              <div className={styles.recipeCardContent}>
                <h3 className={styles.recipeCardTitle}>H6-文字文字文字H6</h3>
                <p className={styles.recipeCardDescription}>
                  p-文字H6-文字文字文字H6-文字文字文字文字文字文字文字文字文字文字文字文字文字文字文字
                </p>
              </div>
              <Image
                src="/images/favorite-icon.png"
                alt="Favorite"
                width={55}
                height={55}
                className={styles.favoriteIcon}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.shopSection}>
        <Image
          src="/images/shop-decoration.png"
          alt="Decoration"
          width={407}
          height={407}
          className={styles.shopDecoration}
        />

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>商城</h2>
          <Link href="/shop" className={styles.moreLink}>
            More
          </Link>
        </div>

        <div className={styles.shopCarousel}>
          <Image
            src="/images/shop-carousel2.jpg"
            alt="Shop items"
            width={1280}
            height={400}
            className={styles.shopCarouselImage}
          />
        </div>

        <div className={styles.topProductsSection}>
          <div className={styles.topProductsImages}>
            <div className={styles.productRankItem}>
              <div className={styles.productCard}>
                <Image
                  src="/images/product-1.jpg"
                  alt="Product"
                  width={284}
                  height={200}
                  className={styles.productImage}
                />
                <div className={styles.productTitle}>��口美國牛菲力</div>
              </div>
              <div className={styles.rankBadge}>
                <div className={styles.rankNumber}>1</div>
              </div>
            </div>

            <div className={styles.productRankItem}>
              <div className={styles.productCard}>
                <Image
                  src="/images/product-2.jpg"
                  alt="Product"
                  width={284}
                  height={200}
                  className={styles.productImage}
                />
                <div className={styles.productTitle}>大西洋鮭魚菲力</div>
              </div>
              <div className={styles.rankBadge}>
                <div className={styles.rankNumber}>2</div>
              </div>
            </div>

            <div className={styles.productRankItem}>
              <div className={styles.productCard}>
                <Image
                  src="/images/product-3.jpg"
                  alt="Product"
                  width={284}
                  height={200}
                  className={styles.productImage}
                />
                <div className={styles.productTitle}>生食級干貝</div>
              </div>
              <div className={styles.rankBadge}>
                <div className={styles.rankNumber}>3</div>
              </div>
            </div>
          </div>

          <div className={styles.topProductsList}>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>4</div>
              <div className={styles.productListTitle}>特選羊小排</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>5</div>
              <div className={styles.productListTitle}>北海道帝王蟹</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>6</div>
              <div className={styles.productListTitle}>三線磯鱸(黃雞魚)</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>7</div>
              <div className={styles.productListTitle}>龍膽石斑</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>8</div>
              <div className={styles.productListTitle}>有機特級杏鮑菇</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>9</div>
              <div className={styles.productListTitle}>日本山藥</div>
            </div>
            <div className={styles.productRankListItem}>
              <div className={styles.rankNumber}>10</div>
              <div className={styles.productListTitle}>巴薩米克醋</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
