import React, { createRef, useEffect, useState } from 'react'
import { message } from 'antd'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

interface Props {
  file: string
}

const Sheet = (props: Props) => {
  let osmd: OSMD | undefined = undefined

  const divRef = createRef()
  const [file, setFile] = useState(props.file)

  useEffect(() => {
    osmd = new OSMD(divRef.current as any)
    loadFile()
  }, [])

  useEffect(() => {
    loadFile()
  }, [props.file])

  const loadFile = async () => {
    if (osmd) {
      if (file !== props.file) {
        setFile(props.file)
        try {
          await osmd.load(file)
          await osmd.render()
        }
        catch (err) {
          console.error(err)
          message.error("Unable to load file")
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