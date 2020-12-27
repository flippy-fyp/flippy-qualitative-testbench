import React from 'react'
import { PageHeader } from 'antd'
import { PlayerState } from '../AppLayout/AppLayout'
import CursorDebug from './DebugComponents/CursorDebug'

const cursorDebug = true

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
}

const DebugPanel = (props: Props) => {
  const { playerState } = props
  const { osmd } = playerState


  return (<PageHeader
    style={{ backgroundColor: '#e0e0e0', padding: '3px 12px' }}
    title="DEBUG PANEL"
    extra={
      <span>
        {osmd && <span>OSMD OK{'  '}</span>}
        {osmd && cursorDebug && <CursorDebug cursor={osmd.cursor} />}
      </span >
    }
  />)
}

export default DebugPanel