import React, { useEffect } from 'react'
import { Modal } from 'antd'

import loadingSVG from './Loading.svg'
import { useLoadingState } from '../../contexts/loadingState'


const Loading = () => {
  let loadingModal: any = undefined;
  const [loadingState] = useLoadingState()

  useEffect(() => {
    const { loading, loadingText } = loadingState
    if (loading) {
      loadingModal = Modal.info({
        content: (<div style={{ textAlign: 'center' }}>
          <h1 style={{ paddingTop: 30, marginBottom: 0, fontSize: '3rem' }}>Loading...</h1>
          {
            loadingText && <div style={{ padding: 20, fontSize: '1rem' }}>{loadingText}</div>
          }
          <img src={loadingSVG} alt="loading" className="loader" />
        </div>)
      })
    } else {
      if (loadingModal) {
        loadingModal.destroy()
      }
    }
  }, [loadingState])
  return <div />
}

export default Loading