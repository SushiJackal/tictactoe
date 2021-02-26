const url = window.location.href

if(url.indexOf('?game=') === -1) {
  gameID = ''
} else {
  gameID = url.substring(url.indexOf('?game=') + 6)
}

let ws = new WebSocket("ws://localhost:80")

let clientID = null;


ws.onmessage = message => {
  const res = JSON.parse(message.data)

  if(res.action === 'login') {
    clientID = res.clientID

    if(gameID === ''){
      payload = {
        action: 'create',
        clientID: clientID
      }
    } else {
      payload = {
        action: 'join',
        clientID: clientID,
        gameID: gameID
      }
    }
    console.log(payload)
    ws.send(JSON.stringify(payload))
  }

  if(res.action === 'lobby'){
    if(res.player === 1){
      console.log(`I am player 1 with symbol ${res.symbol}!`)
    } else {
      console.log(`I am player 2 with symbol ${res.symbol}!`)
    }
    gameStart()
  }
}

function cellClick(cell) {
  payload = {
    action: 'play',
    clientID: clientID,
    gameID: gameID,
    cell: cell
  }
  console.log(payload)
  ws.send(JSON.stringify(payload))
}