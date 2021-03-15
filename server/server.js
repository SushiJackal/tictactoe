const md5 = require('md5')
const path = require('path')
const express = require('express')
const app = express()
const fs = require('fs')

const key = fs.readFileSync(path.join(__dirname, `ssl/localhost-key.pem`), 'utf-8')
const cert = fs.readFileSync(path.join(__dirname, `ssl/localhost.pem`), 'utf-8')
const creds = {key: key, cert: cert}

const server = require('https').createServer(creds, app)
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET"]
  }
})

app.use(express.static(path.join(__dirname, '../client')))//NEEDS TO BE '..' ON SERVER!!!!

server.listen(8080, () => console.log('Listening on port 8080...'))


const clients = {}
const games = {} //LOOK INTO SOCKET.IO ROOMS?

io.on("connection", socket => {
  socket.on("message", msg => {
    const res = JSON.parse(msg)

    if(res.action === 'create') {
      clientID = res.clientID

      if(!clients[clientID]){
        payload = {
          action: 'error',
          error: 'Session token invalid!'
        }
        socket.send(JSON.stringify(payload))
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

      payload = {
        action: 'lobby',
        gameID: gameID,
        symbol: taken,
        player: 1 //needs game state
      }

      socket.send(JSON.stringify(payload))
    }

    if(res.action === 'join') {
      gameID = res.gameID
      clientID = res.clientID

      if(!games[gameID]){
        console.log(`Couldn't join game with ID ${gameID}!`)
        payload = {
          action: 'error',
          error: 'Game not found!'
        }
        socket.send(JSON.stringify(payload))
        return
      } else {
        if(!games[gameID].clients) {
          payload = {
            action: 'error',
            error: 'No host client in this game!'
          }
          socket.send(JSON.stringify(payload))
          return
        }
        if(!clients[clientID]) {
          payload = {
            action: 'error',
            error: 'Session token invalid!'
          }
          socket.send(JSON.stringify(payload))
          return
        }
        if(Object.keys(games[gameID].clients).length === 2){
          console.log(`Game with ID ${gameID} is full!`)
          payload = {
            action: 'error',
            error: 'Game is full!'
          }
          socket.send(JSON.stringify(payload))
          return
        } else {
          games[gameID].clients[clientID] = clientID
          console.log(`Joining game with ID ${gameID}!`)
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

      socket.send(JSON.stringify(payload))
    } //switch case?
  })

  const clID = md5(Date.now())
  clients[clID] = {
    con: socket.id
  }

  pl = {
    action: "login",
    clientID: clID
  }

  socket.send(JSON.stringify(pl))
})