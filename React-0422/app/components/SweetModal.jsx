'use client'
import React from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export default function SweetModal({ show, onHide, title, message, icon }) {
  React.useEffect(() => {
    if (show) {
      Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: '關閉',
        confirmButtonColor: '#6c757d',
      }).then((result) => {
        if (result.isConfirmed) {
          onHide()
        }
      })
    }
  }, [show, title, message, onHide, icon])

  return null
}

// 使用範例
// import SweetModal from '@/app/components/SweetModal'
{
  /* <SweetModal
  show={showModal}
  onHide={() => setShowModal(false)}
  title="提示"
  message="這是一個訊息"
/> */
}
