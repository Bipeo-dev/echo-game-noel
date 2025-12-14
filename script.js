// LA CONFIG
const CAT_SIZE = 100
const TREE_WIDTH = 200
const TREE_HEIGHT = 220

const BASE_MOVE_INTERVAL = 1000
const MIN_MOVE_INTERVAL = 400

const MAX_TIME = 60
const BONUS_TIME = 0.5
const MALUS_TIME = 5
const MALUS_SCORE = 2

const FEEDBACK_DURATION = 500

const DIFFICULTY_STEP_TIME = 15
const MAX_DIFFICULTY = 5

const SECOND_CAT_GAME_TIME = 60

// LE SON
const explosionSound = new Howl({
  src: ['assets/sound/explosion_speed.mp3'],
  volume: 0.1,
  preload: true
})

const wrongSound = new Howl({
  src: ['assets/sound/wrong.mp3'],
  volume: 0.1,
  preload: true
})

const loseSound = new Howl({
  src: ['assets/sound/lose.mp3'],
  volume: 0.1,
  preload: true
})

const gameMusic = new Howl({
  src: ['assets/sound/music.mp3'],
  volume: 0.1,
  preload: true,
  loop: true
})

// SELECTEURS
const trees = document.querySelectorAll('.tree')
const scoreElement = document.getElementById('score')
const timeFill = document.getElementById('time-fill')

// STATES ETOU GENRE LE LORE
let score = 0
let timeLeft = MAX_TIME
let gameOver = false
let gameStarted = false

let difficulty = 0
let timeTick = 1
let currentMoveInterval = BASE_MOVE_INTERVAL

let elapsedGameTime = 0
let secondCatSpawned = false

const cats = []
let moveTimeout = null
let timerInterval = null
let difficultyInterval = null

function updateUI() {
  scoreElement.textContent = score

  const percent = Math.max(0, (timeLeft / MAX_TIME) * 100)
  timeFill.style.width = percent + '%'

  if (percent < 25) timeFill.style.background = 'red'
  else if (percent < 50) timeFill.style.background = 'orange'
  else timeFill.style.background = 'green'
}

// FEEDBACK QUAND ON CLIQUE SUR LE CHAT LA
function showFeedback(cat) {
  const img = document.createElement('img')
  img.src = '/assets/img/explosion.gif'

  img.style.width = '100px'
  img.style.height = '100px'
  img.style.position = 'absolute'
  img.style.left = cat.style.left
  img.style.top = cat.style.top
  img.style.pointerEvents = 'none'
  img.style.zIndex = '10'

  cat.parentElement.appendChild(img)
  explosionSound.play()

  setTimeout(() => img.remove(), FEEDBACK_DURATION)
}

// FEEDPACK QUAND ON SE TROMPE LOOOOOOSER
function showWrongClickFeedback(x, y) {
  const img = document.createElement('img')
  img.src = '/assets/img/incorrect.png'

  img.style.width = '60px'
  img.style.height = '60px'
  img.style.position = 'fixed'
  img.style.left = x - 30 + 'px'
  img.style.top = y - 30 + 'px'
  img.style.pointerEvents = 'none'
  img.style.zIndex = '9999'
  img.style.opacity = '0.9'

  document.body.appendChild(img)
  wrongSound.play()

  setTimeout(() => img.remove(), FEEDBACK_DURATION)
}

// LE PTN DE CHAT
function createCat() {
  const cat = document.createElement('div')
  cat.classList.add('cat')

  cat.addEventListener('click', (e) => {
    e.stopPropagation()
    if (!gameStarted || gameOver) return

    score++
    timeLeft = Math.min(MAX_TIME, timeLeft + BONUS_TIME)

    showFeedback(cat)
    updateUI()
    moveCat(cat)
    scheduleMove()
  })

  return cat
}

function moveCat(cat) {
  const tree = trees[Math.floor(Math.random() * trees.length)]
  if (cat.parentElement) cat.parentElement.removeChild(cat)

  cat.style.left = Math.random() * (TREE_WIDTH - CAT_SIZE) + 'px'
  cat.style.top = Math.random() * (TREE_HEIGHT - CAT_SIZE) + 'px'

  tree.appendChild(cat)
}

// MAUVAIS CLIC
trees.forEach(tree => {
  tree.addEventListener('click', (e) => {
    if (!gameStarted || gameOver) return

    score = Math.max(0, score - MALUS_SCORE)
    timeLeft = Math.max(0, timeLeft - MALUS_TIME)

    showWrongClickFeedback(e.clientX, e.clientY)
    updateUI()
  })
})

// TIMER
function startTimer() {
  timerInterval = setInterval(() => {
    if (gameOver) return

    timeLeft -= timeTick
    elapsedGameTime++

    if (elapsedGameTime >= SECOND_CAT_GAME_TIME && !secondCatSpawned) {
      spawnSecondCat()
    }

    updateUI()
    if (timeLeft <= 0) endGame()
  }, 1000)
}

function increaseDifficulty() {
  if (difficulty >= MAX_DIFFICULTY) return

  difficulty++
  timeTick = 1 + difficulty * 0.3
  currentMoveInterval = Math.max(
    MIN_MOVE_INTERVAL,
    BASE_MOVE_INTERVAL - difficulty * 150
  )

  scheduleMove()
}


function scheduleMove() {
  if (moveTimeout) clearTimeout(moveTimeout)

  moveTimeout = setTimeout(() => {
    cats.forEach(moveCat)
    scheduleMove()
  }, currentMoveInterval)
}

// ça c'est le second chat pour chokbar de bz
function spawnSecondCat() {
  secondCatSpawned = true
  const cat2 = createCat()
  cats.push(cat2)
  moveCat(cat2)
}

function endGame() {
  gameOver = true

  clearInterval(timerInterval)
  clearInterval(difficultyInterval)
  clearTimeout(moveTimeout)

  gameMusic.stop()
  showEndScreen()
}

// la fin en ft
function showEndScreen() {
  const overlay = document.createElement('div')
  overlay.classList.add("endscreen-overlay")
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.background = 'rgba(0,0,0,0.85)'
  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.color = 'white'
  overlay.style.fontSize = '32px'
  overlay.style.zIndex = '9999'
  overlay.style.textAlign = 'center'

  overlay.innerHTML = `
    <h2>c fini !!</h2>
    <p>ton score : ${score}</p>
    <button class="button" id="restart">encore !!!</button>
  `

  loseSound.play()
  document.body.appendChild(overlay)

  document.getElementById('restart').onclick = () => {
    overlay.remove()

    score = 0
    timeLeft = MAX_TIME
    gameOver = false
    difficulty = 0
    timeTick = 1
    currentMoveInterval = BASE_MOVE_INTERVAL
    elapsedGameTime = 0
    secondCatSpawned = false

    cats.forEach(cat => cat.remove())
    cats.length = 0

    const cat1 = createCat()
    cats.push(cat1)
    moveCat(cat1)

    updateUI()

    gameMusic.play()
    startTimer()

    difficultyInterval = setInterval(() => {
      if (!gameOver) increaseDifficulty()
    }, DIFFICULTY_STEP_TIME * 1000)

    scheduleMove()
  }
}


// ECRAN DEBUT
function showStartScreen() {
  const overlay = document.createElement('div')
  overlay.classList.add("start-overlay")
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.background = 'rgba(0,0,0,0.9)'
  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.color = 'white'
  overlay.style.fontSize = '32px'
  overlay.style.zIndex = '9999'
  overlay.style.textAlign = 'center'

  overlay.innerHTML = `
    <h1>Oh non !</h1>
    <p>le slime-chat d'echo est sur le sapin !!!</p>
    <p>clique pour le faire partir !!!</p>
    <button class="button" id="start-game" style="font-size:24px;padding:12px 24px;cursor:pointer;">
      c parti mon kiki
    </button>
  `

  document.body.appendChild(overlay)

  document.getElementById('start-game').onclick = () => {
    overlay.remove()
    gameStarted = true

    gameMusic.play()
    startTimer()

    difficultyInterval = setInterval(() => {
      if (!gameOver) increaseDifficulty()
    }, DIFFICULTY_STEP_TIME * 1000)

    scheduleMove()
  }
}

// pour le lancement
const cat1 = createCat()
cats.push(cat1)
moveCat(cat1)

updateUI()
showStartScreen()
