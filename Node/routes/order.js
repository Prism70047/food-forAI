
import express from "express";
import db from "../utils/connect-mysql.js"; // 連接資料庫

const router = express.Router();

router.post('/', async (req, res) => {
    console.log('📬 後端 /api/orders (來自 order.js 的 POST /) 接口被呼叫了！');
    console.log('收到的請求 body 內容是:', req.body);
    
    // 從 req.body 把前端送來的資料解構出來
    const {
        recipientInfo,
        orderNotes,
        cartItems,
        totalAmount,
        userId,
    } = req.body;

    console.log('--- 後端收到的資料型別檢查 ---');
    console.log('recipientInfo:', recipientInfo, '存在嗎?', !!recipientInfo);
    console.log('cartItems:', cartItems, '存在嗎?', !!cartItems, '長度是0嗎?', cartItems ? cartItems.length === 0 : 'N/A');
    console.log('totalAmount:', totalAmount, '是undefined嗎?', totalAmount === undefined);
    console.log('userId:', userId, '是undefined嗎?', userId === undefined, '是0嗎?', userId === 0);
    console.log('-----------------------------');

    // **基本的資料驗證**
    if (
        !recipientInfo ||
        !cartItems ||
        cartItems.length === 0 || // 購物車不能是空的
        totalAmount === undefined || // 總金額可以是0 不能是 undefined
        userId === undefined || // 使用者ID可以是0 不能是 undefined
        userId === 0 // userId 也不能是 0 (代表未登入的 noAuth.id)
    ) {
        console.error('🚫 訂單資料不完整或不正確！ Body:', req.body);
            return res.status(400).json({ // 400 Bad Request
                success: false,
                message: '訂單資料不完整或不正確！',
            });
        }

        try{
            console.log('模擬：準備寫入主訂單到 `orders` 表...');
            console.log('User ID:', userId);
            console.log('Recipient Info:', recipientInfo);
            console.log('Order Notes:', orderNotes);
            console.log('Total Amount:', totalAmount); 

            const newOrderId = `SIM_ORDER_${Date.now()}`; // ✨✨ 先用一個模擬的訂單ID ✨✨
            console.log('模擬：主訂單寫入成功，新的訂單 ID 是:', newOrderId);

            console.log('模擬：準備寫入商品項目到 `order_items` 表...');
            for (const item of cartItems) {
            console.log(`  - 寫入商品: Product ID: ${item.productId || item.id}, Quantity: ${item.quantity}, Price: ${item.price}`
    );
        }
        console.log('模擬：所有商品項目寫入成功！');

        // 如果上面所有資料庫操作都沒問題：
        console.log('✅ 訂單資料模擬寫入資料庫成功！');
        res.status(201).json({ // 201 Created
        success: true,
        message: '訂單已成功接收並處理！感謝您的訂購！🎉 (來自 order.js)',
        orderId: newOrderId, // 把真實（或模擬的）新訂單ID傳回去
        });
        } catch (dbError) { // 如果資料庫操作過程中發生錯誤
            console.error('😭 資料庫操作時發生錯誤:', dbError);
            res.status(500).json({ // 500 Internal Server Error
            success: false,
            message: '噢喔！訂單處理中發生了一點小問題，請稍後再試一次。 (資料庫錯誤)',
              error: dbError.message, // 可以考慮只在開發模式下回傳詳細錯誤
            });
        }
        
});


export default router;