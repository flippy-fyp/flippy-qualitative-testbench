import React from "react"
import { PageHeader, Button } from "antd"
import { remote } from "electron"
import { initialPlayerState, PlayerState } from "../AppLayout/AppLayout"

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
}

const Navbar = (props: Props) => {
  const { playerState, setPlayerState } = props
  const { sheetFile, ready, started } = playerState

  const openFile = async () => {
    const fileName = await remote.dialog.showOpenDialog({
      title: `Open MusicXML file`,
      properties: [`openFile`],
      filters: [
        {
          name: `MusicXML`,
          extensions: [`xml`, `mxl`, `musicxml`],
        },
      ],
    })
    if (!fileName.canceled && fileName.filePaths.length) {
      setPlayerState({
        ...initialPlayerState,
        sheetFile: fileName.filePaths[0],
      })
    }
  }

  const reset = async () => {
    setPlayerState(initialPlayerState)
  }

  return (
    <PageHeader
      style={{ backgroundColor: "#f3f3f3", padding: "3px 12px" }}
      title="Flippy - Qualitative Testbench"
      subTitle={sheetFile ?? null}
      extra={
        <div>
          <Button type="primary" disabled={ready} onClick={openFile}>
            Open MusicXML file
          </Button>
          <Button disabled={!ready || started} onClick={reset} danger>
            Reset
          </Button>
        </div>
      }
    />
  )
}

export default Navbar
