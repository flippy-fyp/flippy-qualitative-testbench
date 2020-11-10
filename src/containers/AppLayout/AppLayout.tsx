import React, { useState } from 'react'
import Sheet from '../../components/Sheet/Sheet'
import Navbar from '../Navbar/Navbar'

export type PlayerState = {
  sheetFile: string | undefined
  ready: boolean 
}

export const initialPlayerState: PlayerState = {
  sheetFile: undefined,
  ready: false
}

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
      <Sheet playerState={playerState} setPlayerState={setPlayerState} />
    </div>
  )
}

export default AppLayout