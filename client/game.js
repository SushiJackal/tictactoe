const game = document.getElementById('game')
const loading = document.getElementById('loading')

game.style.display = 'none'

function gameStart() {
  game.style.display = 'grid'
  loading.style.display = 'none'
}
