import { PageHeader, Button, Input } from 'antd'
import React, { useEffect } from 'react'
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

  useEffect(() => {
    const localCmd = window.localStorage.getItem(`cmd`)
    if (localCmd) {
      setCmdState({
        ...cmdState,
        cmd: localCmd,
      })
    }
  }, [])

  const start = () => {
    // save the cmd to local state
    try {
      window.localStorage.setItem(`cmd`, cmdState.cmd)
    }
    catch (err) {
      // best effort
      console.debug(err)
    }

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
        disabled={started}
        value={cmdState.cmd} 
        placeholder="Command" 
        style={{ width: `50vw`, fontFamily: `Fira Code, monospace` }} 
        onChange={onChangeCmd} 
      />
    }
    extra={
      <div>
        <Button disabled={!ready || started || cmdState.cmd.length === 0} onClick={start}>Start</Button>
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