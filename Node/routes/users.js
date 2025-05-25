import express from "express";
import db from "../utils/connect-mysql.js";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";

const router = express.Router();

// Zod Schema 用於驗證密碼格式
const passwordSchema = z
  .string()
  .min(8, { message: "密碼長度至少需要 8 個字元" })
  .max(20, { message: "密碼不可超過 20 個字元" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: "密碼需包含大小寫英文字母及數字",
  });

// 修改密碼 API
router.put("/api/change-password", async (req, res) => {
  const output = {
    success: false,
    message: "",
    errors: {}, // 存放欄位驗證錯誤訊息
  };

  // 1. 驗證 JWT Token 並取得 user_id
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    output.message = "未經授權：缺少 Token";
    return res.status(401).json(output);
  }

  const token = authHeader.slice(7);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    output.message = "未經授權：無效的 Token";
    return res.status(401).json(output);
  }

  const userId = decodedToken.user_id; // 從 token 中取得 user_id

  // 2. 從請求 body 取得參數
  const { currentPassword, newPassword } = req.body;

  // 3. 基本參數檢查
  if (!currentPassword || !newPassword) {
    output.message = "請提供目前密碼和新密碼";
    if (!currentPassword) output.errors.currentPassword = "請輸入目前密碼";
    if (!newPassword) output.errors.newPassword = "請輸入新密碼";
    return res.status(400).json(output);
  }

  try {
    // 4. 從資料庫取得使用者目前的 password_hash
    const [userRows] = await db.query("SELECT password_hash FROM users WHERE user_id = ?", [
      userId,
    ]);

    if (!userRows.length) {
      output.message = "找不到該使用者";
      return res.status(404).json(output);
    }

    const storedPasswordHash = userRows[0].password_hash;
    if (!storedPasswordHash) {
      output.message = "使用者密碼資料不完整，請聯繫管理員";
      return res.status(500).json(output);
    }

    // 5. 驗證目前密碼
    const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
    if (!isMatch) {
      output.message = "目前密碼輸入錯誤";
      output.errors.currentPassword = "目前密碼輸入錯誤";
      return res.status(400).json(output);
    }

    // 6. 驗證新密碼格式
    const passwordValidation = passwordSchema.safeParse(newPassword);
    if (!passwordValidation.success) {
      output.message = "新密碼格式不符合要求";
      output.errors.newPassword =
        passwordValidation.error.errors[0]?.message || "密碼需包含大小寫英文字母及數字，長度8-20碼";
      return res.status(400).json(output);
    }

    // 7. 將新密碼加密
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 8. 更新資料庫中的密碼
    const [updateResult] = await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      newPasswordHash,
      userId,
    ]);

    if (updateResult.affectedRows === 1) {
      output.success = true;
      output.message = "密碼已成功更新！";
      res.status(200).json(output);
    } else {
      output.message = "密碼更新失敗，請稍後再試";
      res.status(500).json(output);
    }
  } catch (error) {
    console.error("修改密碼 API 錯誤:", error);
    output.message = "伺服器內部錯誤，請稍後再試";
    res.status(500).json(output);
  }
});

// 取得所有食譜（可擴充分頁）
// router.get('/api', async (req, res) => {
//     try {
//       const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
//       res.json({ success: true, rows });
//     } catch (err) {
//       console.error('取得食譜列表失敗:', err); // ✅ 印出錯誤訊息
//       res.status(500).json({ success: false, error: err.message });
//     }
//   });

// 取得所有會員資料（但會依照分頁來分別顯示不同的資料)
router.get("/api", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    //   這邊的15 就是指一頁幾筆 (不過這是在後端生頁面時才有差。前端的一頁幾筆是由前端那邊為主)
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // 取得總筆數
    const [countResult] = await db.query("SELECT COUNT(*) AS total FROM users");
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // 取得分頁資料
    const [rows] = await db.query("SELECT * FROM users ORDER BY user_id ASC LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);

    res.json({
      success: true,
      rows,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("取得會員列表失敗:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 取得單一會員資料
router.get("/api/:id", async (req, res) => {
  // 加入 JWT 驗證，確保只有已登入且為本人的使用者才能存取
  // --- JWT 驗證開始 ---
  const authHeader = req.get("Authorization");
  console.log("Auth Header:", authHeader); // 除錯，印出 Authorization 標頭的內容

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "未經授權：缺少 Token", debug: { authHeader } });
  }
  const token = authHeader.slice(7);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return res.status(401).json({ success: false, error: "未經授權：無效的 Token" });
  }

  // 檢查請求的 user_id 是否與 token 中的 user_id 相符
  // decodedToken.user_id 是從 JWT payload 中解出來的
  // req.params.id 由 URL 路徑中取得，+req.params.id 將字串轉為數字
  if (decodedToken.user_id !== +req.params.id) {
    return res.status(403).json({ success: false, error: "禁止存取：您無權存取此會員資料" });
  }
  // --- JWT 驗證結束 ---

  try {
    const userId = req.params.id;
    const sql = `
      SELECT 
        user_id, 
        email, 
        phone_number, 
        full_name, 
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, 
        gender, 
        address, 
        username
      FROM users 
      WHERE user_id=?
    `;
    const [rows] = await db.query(sql, [userId]);

    if (!rows.length) {
      return res.status(404).json({ success: false, error: "找不到會員資料" });
    }

    const userProfile = rows[0];
    res.json({ success: true, rows: userProfile }); // 注意：保持 data.rows 的結構
  } catch (error) {
    console.error("取得會員資料 API 錯誤:", error);
    res.status(500).json({ success: false, error: "伺服器錯誤" });
  }
});

// 取得單一會員的訂單 (這是第一種方式，主要差別為這裡的SQL語法是用JOIN來連接資料表)
// router.get('/api/order/:id', async (req, res) => {
//     try {
//       const productId = req.params.id; // 使用 product_id 作為查詢條件

//       // 查產品評論
//       const [productReviewRows] = await db.query(
//         `SELECT
//     u.user_id,
//     u.username,
//     u.full_name,
//     o.order_id,
//     o.total_price,
//     o.order_status,
//     o.order_date,
//     o.payment_status,
//     o.shipping_status,
//     oi.order_item_id,
//     oi.product_id,
//     oi.quantity,
//     oi.unit_price,
//     oi.subtotal
// FROM
//     users u
// JOIN
//     orders o ON u.user_id = o.user_id
// JOIN
//     order_items oi ON o.order_id = oi.order_id
// WHERE
//     u.user_id = ?  -- 替換問號為您想查詢的用戶ID
// ORDER BY
//     o.order_date DESC, o.order_id, oi.order_item_id`,
//         [productId]
//       );

//       if (!productReviewRows.length) {
//         return res.status(404).json({ success: false, error: "找不到產品評論" });
//       }

//       res.json({ success: true, data: productReviewRows });
//     } catch (error) {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   });

// 取得單一會員的訂單 (這是第二種方式，主要差別為這裡的SQL語法是用多個查詢，並且將資料一層一層的裝起來來獲取資料)
// 兩種方式傳出來的JSON資料結構會長的不太一樣 (不過該有的資料一樣都有 ，所以要使用哪一種看個人)
router.get("/api/order/:id", async (req, res) => {
  try {
    const userId = req.params.id; // 使用 user_id 作為查詢條件

    // 查用戶基本資料
    const [userRows] = await db.query(
      "SELECT user_id, username, full_name FROM users WHERE user_id = ?",
      [userId]
    );
    if (!userRows.length) {
      return res.status(404).json({ success: false, error: "找不到用戶" });
    }

    const user = userRows[0];

    // 查用戶的所有訂單
    const [orderRows] = await db.query(
      `SELECT 
           order_id, 
           total_price, 
           order_status, 
           order_date, 
           payment_status, 
           shipping_status 
         FROM 
           orders 
         WHERE 
           user_id = ? 
         ORDER BY 
           order_date DESC`,
      [userId]
    );

    // 將每個訂單的訂單項目查出來，並加進對應的訂單中
    for (const order of orderRows) {
      const [orderItemRows] = await db.query(
        `SELECT 
             order_item_id, 
             product_id, 
             quantity, 
             unit_price, 
             subtotal 
           FROM 
             order_items 
           WHERE 
             order_id = ? 
           ORDER BY 
             order_item_id ASC`,
        [order.order_id]
      );

      // 加進訂單裡面
      order.items = orderItemRows;
    }

    // 將訂單加進用戶資料裡面
    user.orders = orderRows;

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增食譜
router.post("/api", async (req, res) => {
  const { title, description, cook_time, servings, user_id } = req.body;

  try {
    const [result] = await db.query("INSERT INTO recipes SET ?", [
      title,
      description,
      cook_time,
      servings,
      user_id,
    ]);
    res.json({ success: true, insertedId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新食譜
router.put("/api/:id", async (req, res) => {
  const { title, description, cook_time, servings, user_id } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE recipes SET title=?, description=?, cook_time=?, servings=?, user_id=?, updated_at=NOW() WHERE id=?",
      [{ title, description, cook_time, servings, user_id }, req.params.id]
    );
    res.json({ success: !!result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//刪除食譜
router.delete("/api/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM recipes WHERE id=?", [req.params.id]);
    res.json({ success: !!result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
