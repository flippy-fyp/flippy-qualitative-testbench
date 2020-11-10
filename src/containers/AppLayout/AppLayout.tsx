import React, { useEffect } from 'react'
import Sheet from '../../components/Sheet/Sheet'
import { Button } from 'antd'
import Loading from '../../components/Loading/Loading'
import { useLoadingState } from '../../contexts/loadingState'

const AppLayout = () => {
  const [loadingState] = useLoadingState()
  const { loading } = loadingState

  return (
    <div>
      <Button type="ghost">Test</Button>
      <Sheet file="C:\Users\lhlee\Documents\flippy-fyp\flippy-electron\tmp\test.xml" />
      {/* {loading && <Loading/>} */}
    </div>
  )
}

export default AppLayout