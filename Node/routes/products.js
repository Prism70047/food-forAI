// --- routes/product.js ---
import express from "express";
import db from "../utils/connect-mysql.js"; // 連接資料庫
import fs from "node:fs/promises";
import { z } from "zod";
import moment from "moment-timezone";
import upload from "../utils/upload-imgs.js";

const router = express.Router();

// 取得所有商品（會依照分頁來顯示）
router.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;

        // 取得總筆數
        const [countResult] = await db.query('SELECT COUNT(*) AS total FROM food_products');
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // 取得分頁資料
        const [rows] = await db.query(
            'SELECT * FROM food_products ORDER BY id DESC LIMIT ? OFFSET ?',
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


// 取得單一商品資料
router.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // 查詢產品資料
        const [productRows] = await db.query('SELECT * FROM food_products WHERE id = ?', [productId]);
        if (!productRows.length) {
            return res.status(404).json({ success: false, error: "找不到產品" });
        }

        const product = productRows[0];

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


export default router;