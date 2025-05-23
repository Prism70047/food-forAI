// --- routes/product.js ---
import express from "express";
import db from "../utils/connect-mysql.js"; // 連接資料庫
import fs from "node:fs/promises";
import { z } from "zod";
import moment from "moment-timezone";
import upload from "../utils/upload-imgs.js";

const router = express.Router();

// 取得所有商品（會依照分頁來顯示）
//http://localhost:3001/products/api/products
router.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;

        // 取得總筆數 (這部分不變)
        const [countResult] = await db.query('SELECT COUNT(*) AS total FROM food_products');
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // 取得分頁資料，並使用隨機排序
        // 這裡的關鍵就是把 ORDER BY id DESC 改成 ORDER BY RAND()
        const [rows] = await db.query(
            'SELECT * FROM food_products ORDER BY RAND() LIMIT ? OFFSET ?',
            [limit, offset]
        );

        res.json({
            success: true,
            rows,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error("DB 錯誤：", err);
        res.status(500).json({ success: false, error: "伺服器發生錯誤，請稍後再試。" });
    }
});

// router.get('/api/products/filter')
router.get('/api/products/filter', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 15, 100); // 一次查 100 筆
    const offset = (page - 1) * limit; 

    const {
      category= '',
      search = '',
      sort = '', // 可為 'price_asc' 或 'price_desc'
      minPrice = '',
      maxPrice = ''
    } = req.query;

    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push('name LIKE ?');
      queryParams.push(`%${search}%`);
    }

    if (category) {
      whereClauses.push('category = ?'); 
      queryParams.push(category);
    }

    if (minPrice) {
      whereClauses.push('price >= ?');
      queryParams.push(Number(minPrice));
    }

    if (maxPrice) {
      whereClauses.push('price <= ?');
      queryParams.push(Number(maxPrice));
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM food_products ${whereSql}`,
      queryParams
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // 排序邏輯調整
    let orderByClause = 'ORDER BY id DESC'; // 預設排序
    if (sort === 'price_asc') {
      orderByClause = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'ORDER BY price DESC';
    }

    const finalSql = `
      SELECT * FROM food_products
      ${whereSql}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;
    console.log('最終 SQL:', finalSql);

    const [rows] = await db.query(finalSql, [...queryParams, limit, offset]);

    res.json({
      success: true,
      rows,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error('商品篩選錯誤:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// http://localhost:3001/products/api/products/:id
// 取得單一商品資料
router.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        console.log('查詢商品 ID:', productId); // 除錯用
        
        // 查詢產品資料
        const [productRows] = await db.query(
            'SELECT * FROM food_products WHERE id = ?', 
            [productId]
        );
        
        console.log('查詢結果:', productRows); // 除錯用
        
        if (!productRows || !productRows.length) {
            console.log('找不到商品:', productId); // 除錯用
            return res.status(404).json({ 
                success: false, 
                error: "找不到產品",
                debug: { queriedId: productId } 
            });
        }
        
        const product = productRows[0];
        console.log('返回商品資料:', product); // 除錯用
        
        res.json({ 
            success: true, 
            data: product 
        });
    } catch (error) {
        console.error('查詢商品錯誤:', error); // 除錯用
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
// 加入收藏ＡＰＩ
// http://localhost:3001/api/products/favorite
router.post('/api/products/favorite', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ success: false, message: '缺少 user_id 或 product_id' });
  }

  try {
    // 檢查是否已經收藏
    const [existing] = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', 
      [user_id, product_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: '已收藏此商品' });
    }

    // 寫入收藏
    await db.query(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', 
      [user_id, product_id]
    );

    res.json({ success: true, message: '已加入收藏' });
  } catch (err) {
    console.error('新增收藏錯誤:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 取消收藏 API
// http://localhost:3001/api/products/unfavorite
router.delete('/api/products/unfavorite', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ success: false, message: '缺少 user_id 或 product_id' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?', 
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '找不到收藏紀錄' });
    }

    res.json({ success: true, message: '已取消收藏' });
  } catch (err) {
    console.error('取消收藏錯誤:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 取得商品相關推薦 (隨機取得)
router.get('/api/products/:id/recommendations', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 3; // 預設取得4筆
        
        // 先取得目前商品的分類
        const [productRow] = await db.query(
            'SELECT category FROM food_products WHERE id = ?',
            [productId]
        );
        
        if (!productRow.length) {
            return res.status(404).json({ success: false, error: "找不到產品" });
        }
        
        const category = productRow[0].category;
        
        // 優先取得相同分類的商品 (排除當前商品)
        const [relatedProducts] = await db.query(
            'SELECT * FROM food_products WHERE category = ? AND id != ? ORDER BY RAND() LIMIT ?',
            [category, productId, limit]
        );
        
        // 如果相同分類商品不足，則補充其他隨機商品
        if (relatedProducts.length < limit) {
            const additionalCount = limit - relatedProducts.length;
            const [otherProducts] = await db.query(
                'SELECT * FROM food_products WHERE id != ? AND id NOT IN (?) ORDER BY RAND() LIMIT ?',
                [
                    productId, 
                    relatedProducts.length ? relatedProducts.map(p => p.id) : [0], 
                    additionalCount
                ]
            );
            
            relatedProducts.push(...otherProducts);
        }
        
        res.json({
            success: true,
            recommendations: relatedProducts
        });
    } catch (error) {
        console.error('取得推薦商品錯誤:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 新增 API - 取得商品評論 (預設 3 筆)
router.get('/api/products/:id/comments', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 3; // 預設取得3筆評論
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        
        // 取得商品評論總數
        const [countResult] = await db.query(
            'SELECT COUNT(*) AS total FROM product_comments WHERE product_id = ?',
            [productId]
        );
        
        const totalComments = countResult[0].total;
        const totalPages = Math.ceil(totalComments / limit);
        
        // 取得評論列表 (包含使用者資訊)
        const [comments] = await db.query(
            `SELECT 
                pc.id, pc.user_id, pc.product_id, pc.content, pc.rating,
                pc.created_at, pc.updated_at,
                u.name AS user_name, u.avatar AS user_avatar
            FROM 
                product_comments pc
            LEFT JOIN 
                users u ON pc.user_id = u.id
            WHERE 
                pc.product_id = ?
            ORDER BY 
                pc.created_at DESC
            LIMIT ? OFFSET ?`,
            [productId, limit, offset]
        );
        
        res.json({
            success: true,
            comments,
            totalComments,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('取得商品評論錯誤:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 新增 API - 加入購物車
router.post('/api/cart/add', async (req, res) => {
    try {
        const { user_id, product_id, quantity = 1 } = req.body;
        
        // 驗證必要欄位
        if (!user_id || !product_id) {
            return res.status(400).json({ success: false, error: "缺少必要參數" });
        }
        
        // 檢查商品是否存在
        const [productResult] = await db.query(
            'SELECT id, price FROM food_products WHERE id = ?',
            [product_id]
        );
        
        if (!productResult.length) {
            return res.status(404).json({ success: false, error: "找不到商品" });
        }
        
        const productPrice = productResult[0].price;
        
        // 檢查購物車是否已有此商品
        const [cartResult] = await db.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        let result;
        
        if (cartResult.length > 0) {
            // 已有商品，更新數量
            const newQuantity = cartResult[0].quantity + quantity;
            
            [result] = await db.query(
                'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
                [newQuantity, cartResult[0].id]
            );
            
            res.json({
                success: true,
                message: "已更新購物車商品數量",
                data: {
                    cart_item_id: cartResult[0].id,
                    quantity: newQuantity
                }
            });
        } else {
            // 新增商品到購物車
            [result] = await db.query(
                `INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
                VALUES (?, ?, ?, NOW(), NOW())`,
                [user_id, product_id, quantity]
            );
            
            res.json({
                success: true,
                message: "已加入購物車",
                data: {
                    cart_item_id: result.insertId,
                    quantity: quantity
                }
            });
        }
    } catch (error) {
        console.error('加入購物車錯誤:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 新增 API - 加入願望清單
router.post('/api/wishlist/add', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        
        // 驗證必要欄位
        if (!user_id || !product_id) {
            return res.status(400).json({ success: false, error: "缺少必要參數" });
        }
        
        // 檢查商品是否存在
        const [productResult] = await db.query(
            'SELECT id FROM food_products WHERE id = ?',
            [product_id]
        );
        
        if (!productResult.length) {
            return res.status(404).json({ success: false, error: "找不到商品" });
        }
        
        // 檢查願望清單是否已有此商品
        const [wishlistResult] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        if (wishlistResult.length > 0) {
            // 已在願望清單中
            return res.json({
                success: true,
                message: "商品已在願望清單中",
                data: {
                    wishlist_id: wishlistResult[0].id,
                    already_exists: true
                }
            });
        }
        
        // 新增商品到願望清單
        const [result] = await db.query(
            `INSERT INTO wishlist (user_id, product_id, created_at)
            VALUES (?, ?, NOW())`,
            [user_id, product_id]
        );
        
        res.json({
            success: true,
            message: "已加入願望清單",
            data: {
                wishlist_id: result.insertId,
                already_exists: false
            }
        });
    } catch (error) {
        console.error('加入願望清單錯誤:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;