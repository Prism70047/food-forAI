// Node/routes/favorites.js

import express from "express";
import db from "../utils/connect-mysql.js";
import authenticateToken from "../utils/authenticateToken.js"; // 引入 authenticateToken 中介軟體

const router = express.Router();

// GET /api/favorites - 獲取會員收藏商品列表
router.get("/", authenticateToken, async (req, res) => {
  // 使用 authenticateToken
  // authenticateToken 成功後，可以從 req.user 中獲取到 JWT payload
  const userId = req.user.user_id;

  if (!userId) {
    // authenticateToken 應該已經處理了無效 token 的情況，但以防萬一這裡再做一次檢查
    return res.status(403).json({ success: false, error: "無法從 Token 中識別使用者" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const countSql = `
      SELECT COUNT(1) AS totalRows 
      FROM product_favorites pf
      WHERE pf.user_id = ?
    `;
    const [[{ totalRows }]] = await db.query(countSql, [userId]);

    if (totalRows === 0) {
      return res.json({
        success: true,
        data: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0,
        message: "尚無收藏商品",
      });
    }

    const sql = `
      SELECT 
        pf.product_id, 
        pf.created_at AS favorite_created_at,
        fp.name AS product_name,
        fp.brand AS product_brand,
        fp.price AS product_price,
        fp.image_url AS product_image_url
      FROM product_favorites pf
      JOIN food_products fp ON pf.product_id = fp.id
      WHERE pf.user_id = ?
      ORDER BY pf.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [userId, limit, offset]);

    const totalPages = Math.ceil(totalRows / limit);

    res.json({
      success: true,
      data: rows,
      totalPages,
      currentPage: page,
      totalItems: totalRows,
    });
  } catch (error) {
    console.error("Error fetching favorite products:", error);
    res.status(500).json({ success: false, error: "伺服器錯誤，無法取得收藏商品列表" });
  }
});

// DELETE /api/favorites/:productId - 取消收藏商品
router.delete("/:productId", authenticateToken, async (req, res) => {
  // 使用 authenticateToken
  const userId = req.user.user_id;
  const productId = parseInt(req.params.productId);

  if (!userId) {
    return res.status(403).json({ success: false, error: "無法從 Token 中識別使用者" });
  }

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ success: false, error: "無效的商品 ID" });
  }

  try {
    const sql = "DELETE FROM product_favorites WHERE user_id = ? AND product_id = ?";
    const [result] = await db.query(sql, [userId, productId]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "已取消收藏" });
    } else {
      res.status(404).json({ success: false, error: "找不到該收藏項目或取消失敗" });
    }
  } catch (error) {
    console.error("Error unliking product:", error);
    res.status(500).json({ success: false, error: "取消收藏時發生伺服器錯誤" });
  }
});

export default router;
