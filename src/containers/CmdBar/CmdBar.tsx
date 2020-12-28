import { PageHeader, Button, Input } from 'antd'
import React from 'react'
import { CmdState, PlayerState } from '../AppLayout/AppLayout'

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
  cmdState: CmdState
  setCmdState: React.Dispatch<React.SetStateAction<CmdState>>
}

const CmdBar = (props: Props) => {
  const { playerState, setPlayerState, cmdState, setCmdState } = props
  const { ready, started } = playerState

  const start = () => {
    setPlayerState({
      ...playerState,
      started: true,
    })
  }

  const stop = () => {
    setPlayerState({
      ...playerState,
      started: false,
    })
  }

  const onChangeCmd = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setCmdState({
      ...cmdState,
      cmd: event.target.value
    })
  }

  return (<PageHeader
    style={{ backgroundColor: '#e0e0e0', padding: '3px 12px' }}
    title={``}
    subTitle={
      <Input 
        value={cmdState.cmd} 
        placeholder="Command" 
        style={{ width: `50vw`, fontFamily: `Fira Code, monospace` }} 
        onChange={onChangeCmd} 
      />
    }
    extra={
      <div>
        <Button disabled={!ready} onClick={start}>Start</Button>
        <Button
          disabled={!ready || !started}
          danger
          onClick={stop}
        >Stop</Button>
      </div>
    }
  />)
}

export default CmdBar