const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
const websocket = require('websocket').server
const httpServer = http.createServer()

app.use(express.static(path.join(__dirname, '../client')))

httpServer.listen(80, () => console.log('Listening on port 80...'))
app.listen(443, () => console.log('Listening on port 443...'))

const wsServer = new websocket({
  "httpServer" : httpServer
})

wsServer.on("request", req => {
  const con = req.accept(null, req.origin)

  con.on("message", msg => {
    const res = JSON.parse(msg.utf8Data)
  })
})