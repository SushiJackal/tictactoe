const url = window.location.href
const ws = io(`https://${location.hostname}:8080${location.pathname}`)

if(url.indexOf('?game=') === -1) {
  gameID = ''
} else {
  gameID = url.substring(url.indexOf('?game=') + 6)
}

let clientID = null;
let validErrors = [
  'Session token invalid!',
  'Game not found!',
  'No host client in this game!',
  'Game is full!'
]

ws.on('message', message => {
  const res = JSON.parse(message)

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
    gameID = res.gameID
    gameStart()
  } //switch case? ALSO NEEDS CHECKING WHETHER INFORMATION IS ACTUALLY PRESENT ON BOTH CLIENT AND SERVER (what if res.player undefined?)

  if(res.action === 'error'){
    if(validErrors.includes(res.error)){
      handleError(res.error)
    }
  }
})

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

function handleError(err) {
  container = document.getElementById('error')
  panel = document.getElementById('panel')
  panel.innerHTML = err
  container.style.display = 'block'
}