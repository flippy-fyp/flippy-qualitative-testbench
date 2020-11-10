import React, { createRef, useEffect, useState } from 'react'
import { message } from 'antd'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'
import { useLoadingState } from '../../contexts/loadingState'
import { initialPlayerState, PlayerState } from '../../containers/AppLayout/AppLayout'

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
}

const Sheet = (props: Props) => {
  let osmd: OSMD | undefined;
  const divRef = createRef()
  const [_, setLoadingState] = useLoadingState()
  const { playerState, setPlayerState } = props
  const { sheetFile } = playerState

  useEffect(() => {
    loadFile()
  }, [sheetFile])

  const loadFile = async () => {
    try {
      if (sheetFile) {
        setLoadingState({ loading: true, loadingText: `Reading "${sheetFile}"...` })
        osmd = new OSMD(divRef.current as HTMLDivElement, { })
        await osmd.load(sheetFile)
        osmd.render()
        setPlayerState({ ...playerState, ready: true })
        osmd.clear()
      }
    }
    catch (err) {
      console.error(err)
      message.error(`Unable to load "${sheetFile}"`)
      setPlayerState(initialPlayerState)
    }
    setLoadingState({ loading: false })
  }

  return (
    <div>
      <div ref={divRef as any} />
      {
        !sheetFile &&
        <div style={{ marginTop: 24 }}>
          <h1>No file loaded.</h1>
          <p>Please open a file.</p>
        </div>
      }
    </div>
  )
}

export default Sheet