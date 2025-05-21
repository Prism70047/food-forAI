import express from "express";
import multer from "multer";
import upload from "./utils/upload-imgs.js";
import admin2Router from "./routes/admin2.js";
import abRouter from "./routes/address-book.js";
import session from "express-session";
import moment from "moment-timezone";
import mysql_session from "express-mysql-session";
import cors from "cors";
import db from "./utils/connect-mysql.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 設定連到食譜的路由
import recipesRouter from "./routes/recipes.js";
// 設定連到商城的路由
import productsRouter from "./routes/products.js";
// 設定連到使用者的路由 (目前還未使用到，所以先關掉)
import usersRouter from "./routes/users.js";
// 設定連到評價的路由
import reviewRouter from "./routes/products-review.js";
// 設定到餐廳詳細頁面的路由
import restaurantsRouter from "./routes/restaurants.js";
// 設定到購物車的路由
import cartRouter from "./routes/cart.js";
// 設定到聯絡我們的路由
import contactRouter from "./routes/contact.js";

const MySQLStore = mysql_session(session);
const sessionStore = new MySQLStore({}, db);

const app = express();

app.set("view engine", "ejs");

// json web token
app.get('/jwt-sign',(req,res)=>{
    const data = {
        id:26,
        account:"Bang",

    };
    const token = jwt.sign(data,process.env.JWT_KEY);
    res.send(token);
});

app.get("/jwt-verify", (req, res) => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsImFjY291bnQiOiJTaGluZGVyIiwiaWF0IjoxNzQ1OTA4NTU5fQ.LXGvFMNVwMYaHna-ysR7aju5zikDVs5LEWrgaoAjGKE";
    const payload = jwt.verify(token, process.env.JWT_KEY);
    res.json(payload);
  });

  app.post("jwt-verify",(req,res)=>{
    
  })


// *** 設定靜態內容資料夾
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        callback(null, true);
    }
}));

// *** 設定session
app.use(session({
    saveUninitialized: false,  // 未建立session時，不儲存(不建立)未初始化的session
    resave: false,  //內容未變更時，是否要強制回傳
    secret: "secret",
    store: sessionStore,
}));

// 自訂的middlewares
app.use((req, res, next) => {
    res.locals.title = "網頁";
    res.locals.pageName = "";
    res.locals.session = req.session;  //讓ejs可以取得session
    res.locals.originalUrl = req.originalUrl;


// 透過這邊的中介(middleware)處理 JWT (拿Token)
const auth = req.get("Authorization");
console.log({ auth });
if (auth && auth.indexOf("Bearer ") === 0) {
  const token = auth.slice(7); // 去掉 'Bearer '
  try {
    req.my_jwt = jwt.verify(token, process.env.JWT_KEY);
  } catch (ex) {}
}

    next();
});




// Top-level middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // <-- 處理 JSON 請求 body
// 連到食譜
app.use('/recipes', recipesRouter);
app.use('/products', productsRouter);
// 連到use這個路由
app.use('/users', usersRouter);
// 連到評價的
app.use('/products-review', reviewRouter);
// 連到餐廳詳細頁面的
app.use('/restaurants', restaurantsRouter);
// 連到購物車
app.use('/cart', cartRouter);
// 連到聯絡我們的
app.use('/contact', contactRouter);

// 路由定義, 兩個條件: 1. 拜訪的 HTTP 方法, 2. 路徑
app.get("/", (req, res) => {
    // res.send(`<h1>Hello World</h1>`);
    res.locals.title = "網頁" + res.locals.title;
    res.locals.pageName = "json-sales";
    res.render("home", { name: "Shinder" });
});

app.get("/json-sales", (req, res) => {
    const sales = [
        { name: "Bill", age: 28, id: "A001" },
        { name: "Peter", age: 32, id: "A002" },
        { name: "Carl", age: 29, id: "A003" },
    ];
    res.render("json-sales", { sales });
});

app.get("/try-qs", (req, res) => {
    res.json(req.query);
});

app.get("/try-post-form", (req, res) => {
    res.render("try-post-form");
});
app.post("/try-post-form", (req, res) => {
    res.render("try-post-form", req.body);
});

app.post("/try-post", upload.none(), (req, res) => {
    res.json(req.body);
});

app.post("/try-upload", upload.single("avatar"), (req, res) => {
    res.json({
        file: req.file,
        body: req.body,
    });
});
app.post("/try-uploads", upload.array("photos"), (req, res) => {
    res.json(req.files);
});

app.get("/my-params1/abc", (req, res) => {
    res.json({ page: "abc" });
});
// 動態路由
app.get("/my-params1/:action?/:id?", (req, res) => {
    res.json(req.params);
    console.log(req.params);
});


app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/, (req, res) => {
    let u = req.url.split("?")[0]; // 排除 query string 參數
    u = u.slice(3); // 略過前面的三個字元
    u = u.split("-").join("");
    res.json({ u });
});

app.use("/address-book", abRouter);
app.use("/admins", admin2Router);


// 測試 Session
app.get("/try-sess", (req, res) => {
    req.session.my_num = req.session.my_num || 0;
    req.session.my_num++;

    res.json(req.session);
});

///使用moment.js
app.get("/try-moment", (req, res) => {
    const fm = "YYYY-MM-DD HH:mm:ss";
    const m1 = moment(); // 當下時間
    const m2 = moment("2024-02-29");
    const m3 = moment("2023-02-29");

    res.json({
        m1: m1.format(fm),
        m2: m2.format(fm),
        m3: m3.format(fm),
        m1v: m1.isValid(),
        m2v: m2.isValid(),
        m3v: m3.isValid(),
        m1z: m1.tz("Europe/London").format(fm),
        m2z: m2.tz("Europe/London").format(fm),
    });
});

app.get("/yahoo", async (req, res) => {
    const r = await fetch("https://tw.yahoo.com/");
    const txt = await r.text();
    res.send(txt);
});

app.get("/try-db", async (req, res) => {
    const sql = "SELECT * FROM address_book LIMIT 3";
    // rows 是我們要查詢的資料, fields 欄位定義相關訊息
    const [rows, fields] = await db.query(sql);
    res.json({ rows, fields });
});


const strSchema = z.string();
const loginSchema = z.object({
    email: z
        .string({ message: "email 必填" })
        .email({ message: "email 格式不符合" }),
    password: z
        .string({ message: "password 必填" })
        .min(6, { message: "密碼長度至少 6 個字元" }),
});


app.get("/try-zod1", async (req, res) => {
    res.json(strSchema.safeParse("abc"));
});
app.get("/try-zod2", async (req, res) => {
    res.json(strSchema.safeParse(123));
});
app.get("/try-zod3", async (req, res) => {
    // http://localhost:3001/try-zod3?email=shin@test.com&password=1234567
    res.json(loginSchema.safeParse(req.query));
});

// 密碼轉換
app.get("/bcrypt/:password?", async (req, res) => {
    const password = req.params.password || "123456";

    const str = await bcrypt.hash(password, 10);
    res.send(str);
});
app.get("/bcrypt", async (req, res) => {
    const hash = "$2b$10$qltnSe08WfcsPBMCvW7AL.4bFUcrNEdCyPoYoLuuKS1SzWxJ0Anua"
    const result = await bcrypt.compare("123456", hash);
    res.json({ result });

});

// 登入表單
app.get("/login", async (req, res) => {
    if (req.session.admin) {
        // 已經登入時jwt-lo不要跳轉到這個頁面
        return res.redirect("/");
    }
    res.locals.title = "登入 - " + res.locals.title;
    res.locals.pageName = "login";
    res.render("login");
});
//   登出功能
app.get("/logout", async (req, res) => {
    delete req.session.admin;
    req.session.save((error) => {
        if (req.query.bt) {
            res.redirect(req.query.bt);
        } else {
            res.redirect("/");
        }
    });
});



// app.post("/login", upload.none(), async (req, res) => {
//     const output = {
//         success: false,
//         bodyData: req.body,
//         code: 0,
//     };

 // 處理登入, 回應 JWT token
app.post("/jwt-login", upload.none(), async (req, res) => {
    const output = {
      success: false,
      bodyData: req.body,
      code: 0,
      data: {
        id: "",
        email: "",
        // nickname: "",
        username: "",
        token: "",
        full_name: "",
      },
    };
  
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
  
    if (!email || !password) {
      output.code = 400;
      return res.json(output);
    }
  
    const sql = "SELECT * FROM users WHERE email=?";
    const [rows] = await db.query(sql, [email]);
    if (!rows.length) {
      output.code = 402; // 帳號是錯的
      return res.json(output);
    }
    const result = await bcrypt.compare(password, rows[0].password_hash);
    if (!result) {
      output.code = 405; // 密碼是錯的
      return res.json(output);
    }
    // 帳密驗證成功
    const payload = {
      id: rows[0].user_id,
      email: rows[0].email,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY);
  
    // 設定 session
    output.data = {
      id: rows[0].user_id,
      email: rows[0].email,
    //   nickname: rows[0].nickname,
    username: rows[0].username,
      token,
    };
  
    output.code = 200;
    output.success = true;
  
    res.json(output);
  });
  

// 用來測試 token
app.get("/jwt-data", (req, res) => {
    res.json(req.my_jwt);
  });

app.get("/cate1", async (req, res) => {
    const sql = "SELECT * FROM categories ORDER BY category_id DESC";
    const [rows] = await db.query(sql);
    res.json(rows);
});

app.get("/cate2", async (req, res) => {
    const sql = "SELECT * FROM categories";
    const [rows] = await db.query(sql);
    const first = [];
    for (let i of rows) {
        if (!i.parent_id) {
            // 取得第一層的資料
            first.push(i);
        }
    }
    for (let f of first) {
        for (let r of rows) {
            if (f.category_id == r.parent_id) {
                f.children ||= []; // 確保是一個陣列
                f.children.push(r);
            }
        }
    }
    res.json(first);
});

// 可處理多層
app.get("/cate3", async (req, res) => {
    const sql = "SELECT * FROM categories";
    const [rows] = await db.query(sql);
    const dict = {}; // 對應的結構
    for (let r of rows) {
        dict[r.category_id] = r;
    }

    for (let r of rows) {
        if (r.parent_id) {
            // 找到該項目的父項
            const parent = dict[r.parent_id];
            parent.children ||= [];
            parent.children.push(r);
        }
    }
    res.json(rows.filter((v) => !v.parent_id));
});

// 導入到React的前端區塊
app.use(express.static("build"));
app.get("*", (req, res) => {
    res.send(`<!doctype html><html lang="zh"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#000000"/><meta name="description" content="Shinder react hooks"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"/><title>Shinder react hooks</title><script defer="defer" src="/static/js/main.6a205622.js"></script></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body></html>`);
});

// 自訂路由, 都放在 404 設定之前
// ************ 404 頁面 ************
app.use((req, res) => {
    res.status(404).send(`<h1>您走錯路了</h1>`);
});

const port = process.env.WEB_PORT || 3002;

app.listen(port, () => {
    console.log(`Express Server 啟動: ${port}`);
});
