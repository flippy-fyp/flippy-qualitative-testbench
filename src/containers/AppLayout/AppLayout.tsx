import React, { useState } from 'react'
import Sheet from '../../components/Sheet/Sheet'
import { devMode } from '../../globals'
import DebugPanel from '../DebugPanel/DebugPanel'
import Navbar from '../Navbar/Navbar'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import CmdBar from '../../components/CmdBar/CmdBar'
import { CursorProcessor } from '../../utils/cursor/cursor'
import { Follower } from 'src/utils/follower/follower'

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
  osmd: undefined
}

export type CmdState = {
  cmd: string
}

export const initialCmdState: CmdState = {
  cmd: ``
}
const showDebugPanel = devMode && false;

const AppLayout = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState)
  const [cmdState, setCmdState] = useState<CmdState>(initialCmdState)

  return (
    <div
      style={{
        textAlign: `center`,
        margin: `auto`,
      }}
    >
      <Navbar playerState={playerState} setPlayerState={setPlayerState}/>
      <CmdBar playerState={playerState} setPlayerState={setPlayerState} cmdState={cmdState} setCmdState={setCmdState}/>
      {showDebugPanel && <DebugPanel playerState={playerState} setPlayerState={setPlayerState}/>}
      <Sheet playerState={playerState} setPlayerState={setPlayerState}/>
    </div>
  )
}

export default AppLayout