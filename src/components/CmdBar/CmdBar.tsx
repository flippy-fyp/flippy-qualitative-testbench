import { PageHeader, Button, Input, message } from 'antd'
import Bluebird from 'bluebird'
import React, { useEffect, useRef } from 'react'
import { useLoadingState } from '../../contexts/loadingState'
import { Follower } from '../../utils/follower/follower'
import { CmdState, PlayerState } from '../../containers/AppLayout/AppLayout'

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
  cmdState: CmdState
  setCmdState: React.Dispatch<React.SetStateAction<CmdState>>
}

const CmdBar = (props: Props) => {
  const [, setLoading] = useLoadingState()
  const { playerState, setPlayerState, cmdState, setCmdState } = props
  const { ready, started } = playerState
  const followerPromiseRef = useRef<Bluebird<void> | undefined>(undefined)

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
    console.debug(`starting`)
    setLoading({ loading: true, loadingText: `Firing up the follower` })
    // save the cmd to local state
    try {
      window.localStorage.setItem(`cmd`, cmdState.cmd)
    } catch (err) {
      // best effort
      console.debug(err)
    }
    try {
      const { cursorProcessor } = playerState

      if (cursorProcessor === undefined) {
        throw new Error(`cursorProcessor is undefined!`)
      }

      const follower = new Follower(cursorProcessor, cmdState.cmd)

      followerPromiseRef.current = follower
        .start(
          () => {
            console.debug(`Follower ready`)
            setLoading({ loading: false })
          },
          () => {
            console.debug(`Follower stopped`)
            followerPromiseRef.current = undefined
            setLoading({ loading: false })
            stop()
          }
        )
        .catch((err) => {
          setLoading({ loading: false })
          console.error(err)
          message.error(`Something went wrong.`)
        })

      setPlayerState({
        ...playerState,
        started: true,
      })
    } catch (err) {
      setLoading({ loading: false })
      console.error(err)
      message.error(`Something went wrong`)
    }
  }

  const stop = () => {
    if (followerPromiseRef.current) {
      console.debug(`Cancelling active follower`)
      followerPromiseRef.current.cancel()
    }
    setPlayerState({
      ...playerState,
      started: false,
    })
  }

  const onChangeCmd = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setCmdState({
      ...cmdState,
      cmd: event.target.value,
    })
  }

  return (
    <PageHeader
      style={{ backgroundColor: '#e0e0e0', padding: '3px 12px' }}
      title=""
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
          <Button
            disabled={!ready || started || cmdState.cmd.length === 0}
            onClick={start}
          >
            Start
          </Button>
          <Button disabled={!ready || !started} danger onClick={stop}>
            Stop
          </Button>
        </div>
      }
    />
  )
}

export default CmdBar
