import React, { useEffect, useRef } from "react"
import { message } from "antd"
import { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay"
import { useLoadingState } from "../../contexts/loadingState"
import {
  initialPlayerState,
  PlayerState,
} from "../../containers/AppLayout/AppLayout"
import { CursorProcessor } from "../../utils/cursor/cursor"

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
}

const Sheet = (props: Props) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [, setLoadingState] = useLoadingState()
  const { playerState, setPlayerState } = props
  const { sheetFile } = playerState

  useEffect(() => {
    loadFile()
  }, [sheetFile])

  // clear the innerHTML of the div before we can redraw
  // otherwise it will draw at the bottom
  const clearDivRef = async () => {
    if (divRef && divRef.current) {
      divRef.current.innerHTML = ""
    }
  }

  const loadFile = async () => {
    clearDivRef()
    if (!sheetFile) {
      setPlayerState(initialPlayerState)
      return
    }
    setLoadingState({ loading: true, loadingText: `Reading "${sheetFile}"...` })
    try {
      const osmd = new OSMD(divRef.current as HTMLElement, {
        followCursor: true,
      })
      await osmd.load(sheetFile)
      osmd.render()
      const cProc = new CursorProcessor(osmd.cursor, osmd.Sheet)
      setPlayerState({
        ...playerState,
        ready: true,
        osmd,
        cursorProcessor: cProc,
      })
    } catch (err) {
      console.error(err)
      message.error(`Unable to load "${sheetFile}"`)
      setPlayerState(initialPlayerState)
    }
    setLoadingState({ loading: false })
  }

  return (
    <div>
      <div ref={divRef} />
      {!sheetFile && (
        <div style={{ marginTop: 24 }}>
          <h1>No file loaded.</h1>
          <p>Please open a file.</p>
        </div>
      )}
    </div>
  )
}

export default Sheet
