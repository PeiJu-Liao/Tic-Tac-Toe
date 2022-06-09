"use strict"

// DOM Chosen
const container = document.querySelector('.container')
const cells = document.querySelectorAll('[data-index]')
const playerModeChosen = document.querySelector('.gameCover__playerChosen');
const frontPage = document.querySelector('.gameCover')
const iconPage = document.querySelector('.iconChoose')
const gamePage = document.querySelector('.playerMode')
const playerTurn = document.querySelector('.playerMode__whoseTurn span')

// Data 
let circleMoves = []
let forkMoves = []
let emptyCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let onePlayerMode = true
let isCircleIcon = true
let gameFinished = false
let player = 'O'

// 選定遊戲模式(單人/雙人)
playerModeChosen.addEventListener('click', (e) => {
  let target = e.target;
  if (target.dataset.mode === 'single') {
    onePlayerMode = true;
    showIconPage()
  }
  if (target.dataset.mode === 'multi') {
    onePlayerMode = false;
    showIconPage()
  }
  console.log(`onePlayerMode:`, onePlayerMode)
})

//show the Icon Page
function showIconPage() {
  iconPage.style.visibility = "visible"
  frontPage.style.visibility = 'hidden'
  // the 'x' in icon page should return to index page
}

// show the Game Page
function showGamePage() {
  gamePage.style.visibility = "visible"
  frontPage.style.visibility = 'hidden'
  iconPage.style.visibility = "hidden"
}

//element return back to front page (1."x" in icon page 2. "back to home" button)
container.addEventListener('click', (e) => {
  let target = e.target
  // if (target.tagName !== 'BUTTON' || target.tagName !== 'A') return
  if (target.dataset.home === 'home') {
    backToHome()
  }
})

function backToHome() {
  // back to front page
  iconPage.style.visibility = "hidden"
  frontPage.style.visibility = 'visible'
  gamePage.style.visibility = "hidden"
  gameReset()
}

// 選定玩家選擇icon("O"/"X")
iconPage.addEventListener('click', (e) => {
  let target = e.target;
  if (target.tagName !== 'BUTTON') return

  if (target.dataset.icon === 'circle') {
    isCircleIcon = true
    player = 'O'
    showGamePage()
  }
  if (target.dataset.icon === 'fork') {
    isCircleIcon = false
    player = 'X'
    showGamePage()
  }
  console.log(`isCircle:`, isCircleIcon)
  playerTurn.innerHTML = isCircleIcon ? 'O' : 'X';
})

// Main Function (Multi Mode Play)
cells.forEach(cell => {
  cell.addEventListener('click', (e) => {
    let target = e.target;
    if (target.tagName !== 'TD') return

    draw(target, isCircleIcon)
    updateMoves(Number(target.dataset.index), isCircleIcon)
    updateEmptyCells(Number(target.dataset.index), emptyCells)
    const bingo = isCircleIcon ? checkWinner(circleMoves) : checkWinner(forkMoves)

    // if the winner show up
    if (bingo) {
      winnerAnimation(bingo)
      showGameFinishedBanner(isCircleIcon ? 'O' : 'X')
      gameFinished = true
      return
    }
    // if the game draw
    if (emptyCells.length === 0) {
      showGameFinishedBanner(false)
      gameFinished = true
      return
    }
    // if no winner show up or game tie yet
    changePlayer()

    // if the player mode is 'single', start up the computerPlay()
    if (onePlayerMode && player === 'O') {
      // if it's not computer trun then 'return'
      if (isCircleIcon) return
      setTimeout(() => {
        const computerMoves = computerPlay(emptyCells, circleMoves, forkMoves)
        makeComputerMove(computerMoves)
      }, 800)
    }

    if (onePlayerMode && player === 'X') {
      // if it's not computer trun then 'return'
      if (!isCircleIcon) return
      setTimeout(() => {
        const computerMoves = computerPlay(emptyCells, forkMoves, circleMoves)
        makeComputerMove(computerMoves)
      }, 800)
    }
  })
}, { once: true })

// Main Function (Single Mode Play)
function computerPlay(availableMoves, player, computer) {
  // 預設最佳防範位置一個家
  const bestDefendPosition = []
  const playerMoves = Array.from(player)
  const computerMoves = Array.from(computer)
  const availableLength = availableMoves.length

  // 迭代所有可下棋子的棋格
  for (let i = 0; i < availableLength; i++) {
    computerMoves.push(availableMoves[i])
    playerMoves.push(availableMoves[i])

    if (checkWinner(computerMoves)) {
      console.log(`AI:下這一步即將可以贏`)
      return availableMoves[i]

      // 電腦不下這步就是對方贏(把該棋步push進defend array)
    } else if (checkWinner(playerMoves)) {
      bestDefendPosition.push(availableMoves[i])
    }

    playerMoves.pop(availableMoves[i])
    computerMoves.pop(availableMoves[i])
  }

  // 當最佳防範棋步是"空的"，下這步棋
  if (bestDefendPosition.length) {
    console.log(`AI:下這步成功防止對方贏`)
    return bestDefendPosition[0]
  } else if (availableMoves.includes(5)) {
    console.log(`AI:佔據最佳位置(中間):`, 5)
    return 5
  } else {
    const randomIndex = Math.floor(Math.random() * availableLength)
    console.log(`AI:剩餘空白棋格隨機下:`, randomIndex)
    return availableMoves[randomIndex]
  }
}

function makeComputerMove(cell) {
  document.querySelector(`table tr td[data-index="${cell}"]`).click()
}

// draw the piece on the board
function draw(cell, iconCircle) {
  cell.innerHTML = iconCircle ? `<div class='playerMode__table--circle'>O</div>` : `<div class='playerMode__table--fork'>X</div>`
}

// switch the winner
function changePlayer() {
  isCircleIcon = !isCircleIcon
  setTimeout(() => {
    playerTurn.innerHTML = isCircleIcon ? 'O' : 'X';
  }, 500)
}

// update circles/forks currently moves
function updateMoves(cell, player) {
  player ? circleMoves.push(cell) : forkMoves.push(cell)
}

// update the remain empty cells
function updateEmptyCells(cell, empty) {
  const index = empty.findIndex(item => item === cell)
  empty.splice(index, 1)
}

// check if the game already has a winner 
function checkWinner(playerMoves) {
  const winningConditions = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  let bingoLine = null
  winningConditions.forEach(line => {
    if (line.every(item => playerMoves.includes(item))) {
      //put items in array
      bingoLine = line
    }
  })
  return bingoLine
}

// winner exist, show the winnerAnimation
function winnerAnimation(bingoLine) {
  bingoLine.forEach(index => {
    const conection = document.querySelector(`table tr td[data-index='${index}']`)
    conection.classList.add('winner-animation')
    //綁定"動畫結束事件(animationend)，一旦動畫跑完就把屬性"winnerAnimation"拿掉
    conection.addEventListener('animationend', e => {
      e.target.classList.remove('winner-animation')
      //最後的 {once: true} 是要求在事件執行一次之後，就要卸載這個監聽器。因為棋盤格可能會被點錯好幾次，每一次都需要動態地掛上一個新的監聽器，並且用完就要卸載。
    }, { once: true })
  })
}

//winner exist, show the winner banner on the screen
function showGameFinishedBanner(winner) {
  const banner = document.createElement('div')
  banner.classList.add('banner')
  banner.innerHTML = `
      <div class="banner">
      ${winner ? `<h1>🎉congratulations🎉</h1> <h2>" ${winner} " is Winner</h2>` : `<h1>Just Try Again😉</h1> <h2>Game Tie!</h2>`}
      <button class="btn again-btn" data-again> Play Again </button>
    </div>
  `
  setTimeout(() => {
    document.querySelector('.playerMode__page').appendChild(banner)
    document.querySelector('[data-again]').addEventListener('click', () => {
      gameReset()
      removeBanner()
      backToHome()
    })
  }, 800);
}

// reset the game(back to original settings)
function gameReset() {
  console.log(`game reset click`)
  cells.forEach(cell => cell.innerHTML = '')
  circleMoves = []
  forkMoves = []
  emptyCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  isCircleIcon = true
  gameFinished = false
}

function removeBanner() {
  document.querySelector('.banner').remove()
}


