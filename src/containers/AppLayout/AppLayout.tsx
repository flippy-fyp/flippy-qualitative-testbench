import React, { useState } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import Sheet from '../../components/Sheet/Sheet'
import { devMode } from '../../consts'
import DebugPanel from '../DebugPanel/DebugPanel'
import Navbar from '../Navbar/Navbar'
import PortBar from '../../components/PortBar/PortBar'
import { CursorProcessor } from '../../utils/cursor/cursor'

export type PlayerState = {
  sheetFile: string | undefined
  ready: boolean
  started: boolean
  cursorProcessor: CursorProcessor | undefined
  osmd: OpenSheetMusicDisplay | undefined
}

export const initialPlayerState: PlayerState = {
  sheetFile: undefined,
  ready: false,
  started: false,
  cursorProcessor: undefined,
  osmd: undefined,
}

export type PortState = {
  port: number
}

export const initialPortState: PortState = {
  port: 8080,
}
const showDebugPanel = devMode && false

const AppLayout = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(
    initialPlayerState
  )
  const [portState, setPortState] = useState<PortState>(initialPortState)

  return (
    <div
      style={{
        textAlign: `center`,
        margin: `auto`,
      }}
    >
      <div style={{ position: `fixed`, width: `100%`, top: 0, zIndex: 1000 }}>
        <Navbar playerState={playerState} setPlayerState={setPlayerState} />
        <PortBar
          playerState={playerState}
          setPlayerState={setPlayerState}
          portState={portState}
          setPortState={setPortState}
        />
        {showDebugPanel && (
          <DebugPanel
            playerState={playerState}
            setPlayerState={setPlayerState}
          />
        )}
      </div>
      <div style={{ paddingTop: 100 }}>
        <Sheet playerState={playerState} setPlayerState={setPlayerState} />
      </div>
    </div>
  )
}

export default AppLayout
