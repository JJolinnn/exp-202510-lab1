let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
const winningConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');

function init() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('resetScoreBtn').addEventListener('click', resetScore);
    loadScoresFromCookie();
    updateScoreDisplay();
}

function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));
    if (board[cellIndex] !== '' || !gameActive || currentPlayer === 'O') return;
    
    // [安全性修復] 使用 textContent 防止 XSS
    statusDisplay.textContent = `目前位置: ${cellIndex}`;
    makeMove(cellIndex, 'X');
    
    if (gameActive && currentPlayer === 'O') {
        // [安全性修復] 移除 prompt，改用固定延遲
        setTimeout(computerMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    checkResult();
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    if (roundWon) {
        gameActive = false;
        winningCombination.forEach(index => document.querySelector(`[data-index="${index}"]`).classList.add('winning'));
        if (currentPlayer === 'X') { playerScore++; statusDisplay.textContent = '🎉 恭喜您獲勝！'; }
        else { computerScore++; statusDisplay.textContent = '😢 電腦獲勝！'; }
        statusDisplay.classList.add('winner');
        updateScoreDisplay();
        saveScoresToCookie();
        return;
    }
    if (!board.includes('')) {
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
        saveScoresToCookie();
    }
}

function updateStatus() {
    if (gameActive) statusDisplay.textContent = currentPlayer === 'X' ? '您是 X，輪到您下棋' : '電腦是 O，正在思考...';
}

function computerMove() {
    if (!gameActive) return;
    let availableMoves = [];
    board.forEach((cell, index) => { if (cell === '') availableMoves.push(index); });
    if (availableMoves.length > 0) {
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        makeMove(move, 'O');
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = '您是 X，輪到您下棋';
    statusDisplay.classList.remove('winner', 'draw');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
}

function resetScore() {
    playerScore = 0; computerScore = 0; drawScore = 0;
    updateScoreDisplay();
    saveScoresToCookie();
    resetGame();
}

function updateScoreDisplay() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('drawScore').textContent = drawScore;
}

function saveScoresToCookie() {
    const d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    document.cookie = `playerScore=${playerScore}; ${expires}; path=/`;
    document.cookie = `computerScore=${computerScore}; ${expires}; path=/`;
    document.cookie = `drawScore=${drawScore}; ${expires}; path=/`;
}

function loadScoresFromCookie() {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    playerScore = parseInt(getCookie("playerScore")) || 0;
    computerScore = parseInt(getCookie("computerScore")) || 0;
    drawScore = parseInt(getCookie("drawScore")) || 0;
}

init();
