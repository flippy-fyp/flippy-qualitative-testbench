import React, { useState } from 'react'
import Sheet from '../../components/Sheet/Sheet'
import { devMode } from '../../globals'
import DebugPanel from '../DebugPanel/DebugPanel'
import Navbar from '../Navbar/Navbar'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

export type PlayerState = {
  sheetFile: string | undefined
  ready: boolean 
  osmd: OSMD | undefined
}

export const initialPlayerState: PlayerState = {
  sheetFile: undefined,
  ready: false,
  osmd: undefined
}

const showDebugPanel = devMode && true;

const AppLayout = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState)

  return (
    <div
      style={{
        textAlign: `center`,
        margin: `auto`,
      }}
    >
      <Navbar playerState={playerState} setPlayerState={setPlayerState}/>
      {showDebugPanel && <DebugPanel playerState={playerState} setPlayerState={setPlayerState}/>}
      <Sheet playerState={playerState} setPlayerState={setPlayerState} />
    </div>
  )
}

export default AppLayout