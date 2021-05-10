import React from "react"
import { PageHeader, Button } from "antd"
import { remote, shell } from "electron"
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

  const openGHRepoInExternalBrowser = async () => {
    shell.openExternal(
      `https://github.com/flippy-fyp/flippy-qualitative-testbench`
    )
  }

  return (
    <PageHeader
      style={{ backgroundColor: "#f3f3f3", padding: "3px 12px" }}
      title={
        <div onClick={openGHRepoInExternalBrowser} className="appTitle">
          Flippy Qualitative Testbench
        </div>
      }
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
