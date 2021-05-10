import React from "react"
import ReactDom from "react-dom"
import { message } from "antd"
import AppLayout from "./containers/AppLayout/AppLayout"
import { LoadingStateProvider } from "./contexts/loadingState"
import Loading from "./components/Loading/Loading"
import "antd/dist/antd.css"
import "./app.css"

const mainElement = document.createElement("div")
document.body.appendChild(mainElement)

message.config({ top: 32 })

const App = () => {
  return (
    <LoadingStateProvider>
      <Loading />
      <AppLayout />
    </LoadingStateProvider>
  )
}

ReactDom.render(<App />, mainElement)
