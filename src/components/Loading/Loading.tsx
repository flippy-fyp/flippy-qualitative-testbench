import React from 'react'
import { Modal } from 'antd'

import loadingSVG from './Loading.svg'
import { useLoadingState } from '../../contexts/loadingState'


const Loading = () => {
  const [loadingState] = useLoadingState()
  const { loading, loadingText } = loadingState

  return (
    <Modal visible={loading} title="Loading..." footer={null} closable={false} centered={true}>
      <div style={{ textAlign: 'center' }}>
        {
          loadingText && <div style={{ padding: 10, fontSize: '1rem' }}>{loadingText}</div>
        }
        <img src={loadingSVG} alt="loading" className="loader" />
      </div>
    </Modal>
  )
}

export default Loading