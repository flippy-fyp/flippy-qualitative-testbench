import React from 'react'
import { Cursor } from 'opensheetmusicdisplay'
import { Button } from 'antd'

interface Props {
  cursor: Cursor
}

const CursorDebug = (props: Props) => {
  const { cursor } = props

  const hide = async () => {
    cursor.hide()
  }

  const show = async () => {
    cursor.show()
  }

  const next = async () => {
    cursor.next()
  }

  const reset = async () => {
    cursor.reset()
  }

  return <div>
    Cursor:{'   '}
    <Button onClick={hide}>Hide</Button>
    <Button onClick={show}>Show</Button>
    <Button onClick={next}>Next</Button>
    <Button onClick={reset}>Reset</Button>
  </div>
}

export default CursorDebug