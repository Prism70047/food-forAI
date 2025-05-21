import express from "express";
import db from "../utils/connect-mysql.js"; // 連接資料庫

const router = express.Router();
const bcrypt = require("bcryptjs");

// 登入
// POST /api/login
// 帳號為 email，密碼為 password_hash

export default router;
