import React, { createRef, useEffect, useState } from 'react'
import { message } from 'antd'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'
import { useLoadingState } from '../../contexts/loadingState'

interface Props {
  file: string
}

const Sheet = (props: Props) => {
  let osmd: OSMD | undefined = undefined

  const divRef = createRef()
  const [file, setFile] = useState<string | undefined>(undefined)
  const [_, setLoadingState] = useLoadingState()

  useEffect(() => {
    osmd = new OSMD(divRef.current as any)
    loadFile()
  }, [])

  useEffect(() => {
    loadFile()
  }, [props.file])

  const loadFile = async () => {
    if (osmd) {
      if (props.file && file !== props.file) {
        setLoadingState({ loading: true, loadingText: `Reading "${props.file}"` })
        setFile(props.file)
        try {
          await osmd.load(props.file)
          await osmd.render()
        }
        catch (err) {
          console.error(err)
          message.error("Unable to load file")
          setLoadingState({ loading: false })
        }
      }
    }
    else {
      message.error("Cannot load file: OSMD not loaded")
    }
  }

  // @ts-ignore
  return <div ref={divRef} />
}

export default Sheet