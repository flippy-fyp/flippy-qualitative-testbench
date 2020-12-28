import React from 'react'
import { PageHeader, Button } from 'antd'
import { initialPlayerState, PlayerState } from '../AppLayout/AppLayout'
import { remote } from 'electron'

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
}

const Navbar = (props: Props) => {
  const { playerState, setPlayerState } = props
  const { sheetFile, ready } = playerState

  const openFile = async () => {
    const fileName = await remote.dialog.showOpenDialog({
      title: `Open MusicXML file`,
      properties: [`openFile`],
      filters: [
        {
          name: `MusicXML`,
          extensions: [`xml`, `mxl`, `musicxml`],
        }
      ]
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

  return (<PageHeader
    style={{ backgroundColor: '#f3f3f3', padding: '3px 12px' }}
    title="Flippy"
    subTitle={sheetFile ?? null}
    extra={
      <div>
        <Button type="primary" onClick={openFile}>Open MusicXML file</Button>
        <Button
          disabled={!ready}
          onClick={reset}
          danger
        >Reset</Button>
      </div>
    }
  />)
}

export default Navbar