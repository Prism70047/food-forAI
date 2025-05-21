'use client'
// 這個組件的下面有寫簡易的使用說明(在第32行之後)

import { Modal, Button } from 'react-bootstrap'
import { useState } from 'react'

export default function LoginModal({
  message = '需要登入才能使用此功能喔！',
  show,
  onHide,
  onNavigateToLogin,
}) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>請先登入</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          關閉
        </Button>
        <Button variant="primary" onClick={onNavigateToLogin}>
          前往登入
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// 首先在需要使用這個組件的page.jsx最上面寫上
// import { useRouter } from 'next/navigation'
// import LoginModal from './LoginModal'

// 接著寫上這個登入彈出視窗的狀態，以及啟用useRouter
//   const [showLoginModal, setShowLoginModal] = useState(false)
//   const router = useRouter()

// 接著在return之後的某個地方使用這個組件
// message= 之後" "內的字可以自己寫。 沒寫的話預設顯示"需要登入才能使用此功能喔！"
{
  /* <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        message="需要登入才能收藏食譜喔！"
        onNavigateToLogin={() => {
          setShowLoginModal(false)
          router.push('/login')
        }}
      /> */
}

// 在未登入狀態下，按下某個按鍵後需要跳出這個彈出視窗的話，
// 需要在這個按鍵的點擊事件有這個判斷式。
// 至於這個判斷式要加在哪，可能要來問我或自己查一下。
// if (!auth.isAuth) {

//       setShowLoginModal(true)
//       return
//     }
