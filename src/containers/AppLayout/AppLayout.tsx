import React, { useEffect } from 'react'
import Sheet from '../../components/Sheet/Sheet'
import { Button } from 'antd'
import { useLoadingState } from '../../contexts/loadingState'
import Loading from '../../components/Loading/Loading'

const AppLayout = () => {

  return (
    <div>
      <Button type="ghost">Test</Button>
      <Sheet file="C:\Users\lhlee\Documents\flippy-fyp\flippy-electron\tmp\test.xml" />
      <Loading />
    </div>
  )
}

export default AppLayout