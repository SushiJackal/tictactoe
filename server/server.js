const md5 = require('md5')
const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
const websocket = require('websocket').server
const { readSync } = require('fs')
const httpServer = http.createServer()

app.use(express.static(path.join(__dirname, '../client')))

httpServer.listen(80, () => console.log('Listening on port 80...'))
app.listen(443, () => console.log('Listening on port 443...'))

const wsServer = new websocket({
  "httpServer" : httpServer
})

const clients = {}
const games = {}


wsServer.on("request", req => {
  const con = req.accept(null, req.origin)

  con.on("message", msg => {
    const res = JSON.parse(msg.utf8Data)

    if(res.action === 'create') {
      console.log('Creating game...')
    }

    if(res.action === 'join') {
      gameID = res.gameID
      console.log(`Joining game with ID ${gameID}`)
    }
  })

  const clientID = md5(Date.now())
  clients[clientID] = {
    con: con
  }

  const payload = {
    action: "login",
    clientID: clientID
  }

  con.send(JSON.stringify(payload))
})