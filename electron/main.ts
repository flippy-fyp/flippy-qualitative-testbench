import { app, BrowserWindow, protocol, nativeImage } from "electron"
import * as path from "path"
import * as url from "url"
import "core-js/stable"
import "regenerator-runtime/runtime"

let mainWindow: Electron.BrowserWindow | null

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, `favicon.png`))

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      webSecurity: false,
    },
    title: "Flippy Qualitative Testbench",
    icon,
  })
  mainWindow.setMenuBarVisibility(false)

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:4000`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    )
  }

  mainWindow.webContents.on(`did-finish-load`, () => {
    if (mainWindow) {
      mainWindow.setTitle(`Flippy Qualitative Testench`)

      mainWindow.webContents.on("zoom-changed", (_event, zoomDirection) => {
        if (mainWindow) {
          const currentZoom = mainWindow.webContents.getZoomFactor()
          if (zoomDirection === "in" && currentZoom < 5.0) {
            mainWindow.webContents.zoomFactor = currentZoom + 0.2
          }
          if (zoomDirection === "out" && currentZoom > 0.4) {
            mainWindow.webContents.zoomFactor = currentZoom - 0.2
          }
        }
      })
    }
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", createWindow)
app.allowRendererProcessReuse = true

app.whenReady().then(() => {
  protocol.registerFileProtocol("file", (request, callback) => {
    const pathname = request.url.replace("file:///", "")
    callback(pathname)
  })
})
