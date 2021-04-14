import React from "react"
import { Modal } from "antd"

import { useLoadingState } from "../../contexts/loadingState"

const Loading = () => {
  const [loadingState] = useLoadingState()
  const { loading, loadingText } = loadingState

  return (
    <Modal
      visible={loading}
      title="Loading..."
      footer={null}
      closable={false}
      centered
    >
      <div style={{ textAlign: "center" }}>
        {loadingText && (
          <div style={{ padding: 10, fontSize: "1rem" }}>{loadingText}</div>
        )}
        <div>Hit Reload (Ctrl/Cmd+R) if this hangs...</div>
      </div>
    </Modal>
  )
}

export default Loading
