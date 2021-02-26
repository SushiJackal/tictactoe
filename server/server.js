const md5 = require('md5')
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

const clients = {}
const games = {}


wsServer.on("request", req => {
  const con = req.accept(null, req.origin)

  con.on("message", msg => {
    const res = JSON.parse(msg.utf8Data)

    if(res.action === 'create') {
      clientID = res.clientID

      if(!clients[clientID]){
        return
      }

      let taken = (() => {
        if(Math.random() <= 0.5) {
          return 'cross'
        } else {
          return 'circle'
        }
      })()

      gameID = md5(Date.now())
      games[gameID] = {clients: {}}
      games[gameID].clients[clientID] = clientID
      games[gameID].taken = taken

      console.log(`Created game with ID ${gameID} and host client ${clientID}!`)
      console.log(games)

      payload = {
        action: 'lobby',
        gameID: gameID,
        symbol: taken,
        player: 1 //needs game state
      }

      con.send(JSON.stringify(payload))
    }

    if(res.action === 'join') {
      gameID = res.gameID
      clientID = res.clientID

      if(!games[gameID]){
        console.log(`Couldn't join game with ID ${gameID}!`)
      } else {
        if(!games[gameID].clients) {
          return
        }
        if(!clients[clientID]) {
          return
        }
        if(Object.keys(games[gameID].clients).length === 2){
          console.log(`Game with ID ${gameID} is full!`)
        } else {
          games[gameID].clients[clientID] = clientID
          console.log(games)
        }
      }

      if(games[gameID].taken === 'cross') {
        var free = 'circle'
      } else {
        var free = 'cross'
      }

      payload = {
        action: 'lobby',
        gameID: gameID,
        symbol: free,
        player: 2 //needs game state
      }

      con.send(JSON.stringify(payload))
    }
  })

  const clID = md5(Date.now())
  clients[clID] = {
    con: con
  }

  pl = {
    action: "login",
    clientID: clID
  }

  con.send(JSON.stringify(pl))
})