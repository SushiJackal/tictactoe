const md5 = require('md5')
const path = require('path')
const https = require('https')
const express = require('express')
const app = express()
const websocket = require('websocket').server
const fs = require('fs')

const key = fs.readFileSync(path.join(__dirname, `ssl/localhost-key.pem`), 'utf-8')
const cert = fs.readFileSync(path.join(__dirname, `./ssl/localhost.pem`), 'utf-8')
const creds = {key: key, cert:cert}

app.use(express.static(path.join(__dirname, '../client')))

const httpsServer = https.createServer(creds, app)
httpsServer.listen(8080, () => console.log('Listening on port 8080...'))
app.listen(8081, () => console.log('Listening on port 8081...'))

const wsServer = new websocket({
  "httpServer" : httpsServer
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