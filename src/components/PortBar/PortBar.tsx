import { PageHeader, Button, Input, message } from 'antd'
import Bluebird from 'bluebird'
import React, { useEffect, useRef } from 'react'
import { portLocalStorageKey } from '../../consts'
import { useLoadingState } from '../../contexts/loadingState'
import { Follower } from '../../utils/follower/follower'
import { PortState, PlayerState } from '../../containers/AppLayout/AppLayout'
import { parsePortString } from '../../utils/port/port'

interface Props {
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
  portState: PortState
  setPortState: React.Dispatch<React.SetStateAction<PortState>>
}

const PortBar = (props: Props) => {
  const [, setLoading] = useLoadingState()
  const { playerState, setPlayerState, portState, setPortState } = props
  const { ready, started } = playerState
  const followerPromiseRef = useRef<Bluebird<void> | undefined>(undefined)

  useEffect(() => {
    const localPortState = window.localStorage.getItem(portLocalStorageKey)
    if (localPortState) {
      setPortState({
        ...portState,
        port: parsePortString(localPortState),
      })
    }
  }, [])

  const start = () => {
    console.debug(`starting`)
    setLoading({ loading: true, loadingText: `Firing up the follower` })
    // save the port to local state
    try {
      window.localStorage.setItem(
        portLocalStorageKey,
        portState.port.toString()
      )
    } catch (err) {
      // best effort
      console.debug(err)
    }
    try {
      const { cursorProcessor } = playerState

      if (cursorProcessor === undefined) {
        throw new Error(`cursorProcessor is undefined!`)
      }

      const follower = new Follower(cursorProcessor, portState.port)

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

  const onChangePort = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setPortState({
      ...portState,
      port: parsePortString(event.target.value),
    })
  }

  return (
    <PageHeader
      style={{ backgroundColor: '#e0e0e0', padding: '3px 12px' }}
      title=""
      subTitle={
        <>
          Port number:{' '}
          <Input
            disabled={started}
            value={portState.port}
            style={{ width: `50vw`, fontFamily: `Fira Code, monospace` }}
            onChange={onChangePort}
          />
        </>
      }
      extra={
        <div>
          <Button disabled={!ready || started} onClick={start}>
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

export default PortBar
