'use client'

// context套用第1步: 建立context
import { createContext, useState, useContext } from 'react'
import { useEffect } from 'react'

// createContext的傳入參數是 defaultValue，是在套用context失敗或有錯誤發生時會得到的預設值(也有備援值的概念)，可以用有意義的值或是null(通常是針對物件或是除錯用)
const CartContext = createContext(null)
// 設定displayName屬性(呈現名稱)
// 可選的屬性，用於搭配react devtools(瀏覽器擴充)使用，方便除錯。不給定的話都是統一使用"Context"名稱
CartContext.displayName = 'CartContext'

// 建立CartProvider元件，它也是用來包裹套嵌用的元件(前後開頭結尾)
// 要共享的狀態放在這元件中各別管理(而不是放在Providers元件中)
// 導出(命名導出 named export)
export function CartProvider({ children }) {
  // 購物車中的項目
  // 與商品的物件值會相差一個count屬性(數字類型，代表購買的數量)
  const [items, setItems] = useState([])

  //   決定是否為第一次渲染的狀態(透過布林值)
  const [didMount, setDidMount] = useState(false)

  // 處理遞增數量
  const onIncrease = (itemId) => {
    const nextItems = items.map((item) => {
      // 在成員(物件)中比對出id為itemId的成員
      if (item.id === itemId) {
        // 如果比對，拷貝物件+遞增count屬性值(item.count+1)
        return { ...item, count: item.count + 1 }
      } else {
        // 否則返回原物件
        return item
      }
    })

    //  設定到狀態
    setItems(nextItems)
  }

  // 處理遞減數量
  const onDecrease = (itemId) => {
    const nextItems = items.map((item) => {
      // 在成員(物件)中比對出id為itemId的成員
      if (item.id === itemId) {
        // 如果比對，拷貝物件+遞減count屬性值(item.count-1)
        return { ...item, count: item.count - 1 }
      } else {
        // 否則返回原物件
        return item
      }
    })

    //  設定到狀態
    setItems(nextItems)
  }

  // 處理刪除
  const onRemove = (itemId) => {
    const nextItems = items.filter((item) => {
      //過濾出id不是為itemId的資料
      return item.id != itemId
    })

    //  設定到狀態
    setItems(nextItems)
  }

  // 處理新增
  const onAdd = (product) => {
    // 判斷要加入的商品是否已經在購物車中
    const foundIndex = items.findIndex((v) => v.id === product.id)

    if (foundIndex !== -1) {
      // 如果有找到 ===> 遞增商品數量
      onIncrease(product.id)
    } else {
      // 否則 ===> 新增商品到購物車
      // 定義要新增的購物車項目, 與商品的物件值會相差一個count屬性(數字類型，代表購買的數量)
      const newItem = { ...product, count: 1 }
      // 加到購物車前面
      const nextItems = [newItem, ...items]
      // 設定到狀態
      setItems(nextItems)
    }
  }

  // 使用陣列的迭代方法reduce來計算總數量/總價
  // 稱為衍生/派生狀態(derived state)，意即是狀態的一部份，或是由狀態計算得來的變數值
  const totalQty = items.reduce((acc, v) => acc + v.count, 0)
  const totalAmount = items.reduce((acc, v) => acc + v.count * v.price, 0)

  //   第一次渲染完成後，從localStorage中讀取(取出)購物車項目。如果有資料時，設定到items狀態中
  useEffect(() => {
    // 從localStorage中讀取(取出)購物車項目，key為cart。沒資料時為空陣列
    setItems(JSON.parse(localStorage.getItem('cart')) || [])
    // 已完成第一次渲染完成後，將該狀態設為true
    setDidMount(true)
  }, [])

  //   當狀態items發生變化時，更新localStorage中的購物車項目
  //   因為要排除掉第一次渲染，所以需要宣告一個特殊的狀態來做控制
  useEffect(() => {
    // 如果在第一次渲染之後
    if (didMount) {
      // 裡面要進行的是 items --> localStorage方向的同步化
      localStorage.setItem('cart', JSON.stringify(items))
    }
    // 下面這一行為告訴eslint不用檢查下面這一行[items]
    // eslint-disable-next-line
  }, [items])
  return (
    <CartContext.Provider
      // 要傳出的值屬性比較多時，可以按值or函式分組，與按英文名稱由上到下排序
      value={{
        items,
        totalAmount,
        totalQty,
        onAdd,
        onDecrease,
        onIncrease,
        onRemove,
        didMount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// 導出(命名導出 named export)自訂名稱的勾子(hook)，配合上面的AuthProvider使用，用於解析出對應的context的value屬性值，專用名稱可以讓閱讀性較佳
// 注意: 如果想要在編輯器中有提示或自動完成功能，需要使用TypeScript或是JSDoc來定義回傳值的類型。
/**
 *
 * useAuth是一個設計專門用來讀取CartContext的值的勾子(hook)。
 * items, totalAmount, totalQty, onAdd, onDecrease, onIncrease, onRemove,
 *
 * @returns {{items: Array, totalAmount:number,  totalQty: number, onAdd: Function, onDecrease: Function, onIncrease: Function, onRemove: Function,}}
 */
export const useCart = () => useContext(CartContext)
