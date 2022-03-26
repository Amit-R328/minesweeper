'use strict'
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    showenCount: 0,
    markedCount: 0,
    secondsPassed: 0,
    lives: 3,
};
var gIntervalTimerId
var gHints = [{ hintOn: false, spent: false }, { hintOn: false, spent: false }, { hintOn: false, spent: false }]
var gIntervalHintId
var clickAfterHints

//const
const MINE = '💣';
const MARK = '🚩';
const EMPTY = '';
const LOSS = '🤯'
const NORMAL = '🙂'
const WIN = '😎'
const LIFE = '❤'

function initGame(level) {
    switch (level) {
        case 0:
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break;
        case 1:
            gLevel.SIZE = 8
            gLevel.MINES = 12
            break;
        case 2:
            gLevel.SIZE = 12
            gLevel.MINES = 30
            break;
    }

    gBoard = buildBoard();

    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${LIFE}${LIFE}${LIFE}`
    var elSmily = document.querySelector('.smiley')
    elSmily.innerHTML = `${NORMAL}`

    renderBoard(gBoard);
    renderHints()

    gGame.lives = 3
    gGame.showenCount = 0
    gGame.markedCount = 0
    gGame.secondsPassed = 0;
    gGame.isOn = false

    clearInterval(gIntervalTimerId);
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = `${gGame.secondsPassed}`
}



function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                neighborsCount: 0,
                isHintRevealed: false
            };
        }
    }
    return board;
}

function renderHints() {
    var strHTML = ''
    for (var i = 0; i < gHints.length; i++) {
        strHTML += `<img src="images/download.png" class="hint" id="${i}" onclick="onHint(this)"/>`
    }
    var elHints = document.querySelector('.hints')
    elHints.innerHTML = strHTML
}

function onHint(elhint) {
    var hintNum = elhint.id
    hintNum = parseInt(hintNum)
    if (!gGame.isOn) return
    for (var i = 0; i < gHints.length; i++) {
        if (hintNum === i && gHints[i].hintOn === false && gHints[i].spent === false) {
            gHints[i].hintOn = true;
            elhint.classList.add('spent')
            return
        }

    }

}

function restart() {
    gBoard = buildBoard();

    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${LIFE}${LIFE}${LIFE}`
    var elSmily = document.querySelector('.smiley')
    elSmily.innerHTML = `${NORMAL}`

    renderBoard(gBoard);
    renderHints()

    gGame.lives = 3
    gGame.showenCount = 0
    gGame.markedCount = 0
    gGame.secondsPassed = 0;
    gGame.isOn = false

    clearInterval(gIntervalTimerId);
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = `${gGame.secondsPassed}`
}


function setMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        board[getRandomIntInclusive(0, board.length - 1)][getRandomIntInclusive(0, board[0].length - 1)].isMine = true;
    }
    var minesCount = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine) minesCount++;
        }
    }
    while (minesCount < gLevel.MINES) {
        board[getRandomIntInclusive(0, board.length - 1)][getRandomIntInclusive(0, board[0].length - 1)].isMine = true;
    }
}

function renderBoard(board) {
    var strHTML = '<table border="1"<tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = [i][j];
            var className = 'cell cell-' + i + '-' + j
            strHTML += `<td data-i="${i}" data-j="${j}" class="${className}" onclick="cellClicked(this,${i},${j})" onclick="cellMark(this)"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody><table>'
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function countMinesAround(board, rowIdx, colIdx) {
    var neighborsSum = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (board[i][j].isMine) neighborsSum++;
        }
    }
    board[rowIdx][colIdx].neighborsCount = neighborsSum
    return neighborsSum;
}

window.addEventListener('contextmenu', function (e) {
    e.preventDefault()
    cellMark(e.target)
}, false)

function cellMark(elCell) {

    var targetCell = gBoard[elCell.dataset.i][elCell.dataset.j];
    
    if (targetCell.isShown) return
    if (!targetCell.isMarked) {
        targetCell.isMarked = true;

        gGame.markedCount++;
        gGame.showenCount++
        elCell.innerHTML = `${MARK}`
    } else {
        targetCell.isMarked = false;
        elCell.innerHTML = `${EMPTY}`
        gGame.markedCount--
    }
    checkGame();
}

function cellClicked(elCell, rowIdx, colIdx) {
    if (!gGame.isOn) { //if first click
        gGame.isOn = true
        setMines(gBoard)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                countMinesAround(gBoard, i, j)
            }
        }
        startTimer()
        var targetCell = gBoard[rowIdx][colIdx]
        targetCell.isShown = true
        gGame.showenCount++
        
    } else {
        var targetCell = gBoard[rowIdx][colIdx]
        
        if (targetCell.isMine) {
            elCell.innerHTML = `${MINE}`
            targetCell.isShown = true
            gGame.showenCount++
            renderCell(rowIdx, colIdx, MINE)
            onMine();
        }
    }
    for (var i = 0; i < gHints.length; i++) {
        if (gHints[i].hintOn) {
            revealHint(rowIdx, colIdx, i)
            gHints[i].hintOn = false;
            return
        }
    }
    if (targetCell.neighborsCount > 0 && targetCell.isMine === false) {
        var number = targetCell.neighborsCount
        renderCell(rowIdx, colIdx, number)
    } else if (targetCell.neighborsCount === 0 && targetCell.isMine === false) {
        elCell.style.backgroundColor = 'grey'
        targetCell.isShown = true;
        expend(gBoard, rowIdx, colIdx)
    }
    checkGame()

}

function revealHint(rowIdx, colIdx, hintNum) {

    var shownCells = []
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                shownCells.push({ i: i, j: j })
                renderCell(i, j, gBoard[i][j].neighborsCount)
            }
        }
    }
    setTimeout(() => {
        for (var i = 0; i < shownCells.length; i++) {
            var coordHint = shownCells[i]
            gBoard[coordHint.i][coordHint.j].isShown = false

            renderCell(coordHint.i, coordHint.j, EMPTY);
        }
    }, 1000)
}

function onMine() {
    gGame.lives--;
    var elLives = document.querySelector('.lives')
    if (gGame.lives === 2) elLives.innerHTML = `${LIFE}${LIFE}`
    else if (gGame.lives === 1) elLives.innerHTML = `${LIFE}`
    else onLoss()
}

function expend(board, rowIdx, colIdx) {

    var targetCell = board[rowIdx][colIdx];
    if (targetCell.neighborsCount > 0) return
    var startRow = (rowIdx === 0) ? rowIdx : rowIdx - 1
    var endRow = (rowIdx === gLevel.SIZE - 1) ? rowIdx : rowIdx + 1
    var startCol = (colIdx === 0) ? colIdx : colIdx - 1
    var endCol = (colIdx === gLevel.SIZE - 1) ? colIdx : colIdx + 1
    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            var currCell = board[i][j]
            if (i === rowIdx && j === colIdx) {
                continue
            } else {
                if (currCell.neighborsCount >= 0) {
                    if (currCell.isMine === false) {
                        if (currCell.isShown === false) {
                            currCell.isShown = true;
                            gGame.showenCount++
                            renderCell(i, j, EMPTY)
                            document.querySelector(`[data-i="${i}"][data-j="${j}"]`).style.backgroundColor = 'grey'
                            if (gLevel.SIZE === 4) expend(board, i, j);
                        }
                    }
                }
            }
        }
    }
}

function renderCell(rowIdx, colIdx, cellContent) {
    var elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
    elCell.innerHTML = `${cellContent}`;
}

function checkGame() {
   
    var counter = 0
    for(var i = 0; i < gLevel.SIZE; i++){
        for(var j=0; j< gLevel.SIZE;j++){
            var targetCell = gBoard[i][j]
            if(targetCell.isMarked && targetCell.isMine) counter++
        }
    }
    if(counter === gLevel.MINES) onWin()
}

function onWin() {
    var elSmily = document.querySelector('.smiley')
    elSmily.innerHTML = `${WIN}`
}

function showMines() { //on loss
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            cell.isShown = true;
            if (cell.isMine) {
                renderCell(i, j, MINE)
            }
        }
    }
}

function onLoss() {
    var elSmily = document.querySelector('.smiley')
    elSmily.innerHTML = `${LOSS}`
    showMines();
}

function startTimer() {
    gIntervalTimerId = setInterval(() => {
        gGame.secondsPassed += 0.01
        var elTimer = document.querySelector('.timer')
        elTimer.innerText = gGame.secondsPassed.toFixed(3)
    }, 10)
}


