import React, { useRef } from 'react'
import { Cursor } from 'opensheetmusicdisplay'
import { Button } from 'antd'

interface Props {
  cursor: Cursor
}

const CursorDebug = (props: Props) => {
  const stepRef = useRef<number>(0)
  const { cursor } = props

  const hide = async () => {
    cursor.hide()
  }

  const show = async () => {
    cursor.show()
  }

  const next = async () => {
    stepRef.current++
    console.debug(stepRef.current)
    cursor.next()
  }

  const reset = async () => {
    stepRef.current = 0
    cursor.reset()
  }

  return (
    <div>
      Cursor:{'   '}
      <Button onClick={hide}>Hide</Button>
      <Button onClick={show}>Show</Button>
      <Button onClick={next}>Next</Button>
      <Button onClick={reset}>Reset</Button>
    </div>
  )
}

export default CursorDebug
