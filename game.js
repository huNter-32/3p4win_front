// 游戏状态
const gameState = {
    mode: null,
    currentPlayer: 0,
    board: Array(15).fill().map(() => Array(15).fill(null)),
    colors: ['red', 'yellow', 'green'],
    colorNames: { red: '红', yellow: '黄', green: '绿' }
};

// DOM元素
const elements = {
    modeSelection: document.getElementById('mode-selection'),
    localBtn: document.getElementById('local-btn'),
    onlineBtn: document.getElementById('online-btn'),
    roomInput: document.getElementById('room-input'),
    joinBtn: document.getElementById('join-btn'),
    playerInfo: document.getElementById('player-info'),
    board: document.getElementById('board'),
    gameStatus: document.getElementById('game-status'),
    turnIndicator: document.getElementById('turn-indicator'),
    currentColorDot: document.getElementById('current-color-dot'),
    turnText: document.getElementById('turn-text')
};

// 初始化游戏
function initGame() {
    initBoard();
    setupEventListeners();
}

function initBoard() {
    elements.board.innerHTML = '';
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleMove(row, col));
            elements.board.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    elements.localBtn.addEventListener('click', startLocalGame);
    elements.onlineBtn.addEventListener('click', showOnlineInput);
    elements.joinBtn.addEventListener('click', joinOnlineGame);
}

function startLocalGame() {
    gameState.mode = 'local';
    elements.modeSelection.style.display = 'none';
    elements.playerInfo.style.display = 'flex';
    elements.board.style.display = 'grid';
    elements.turnIndicator.style.display = 'flex';
    
    gameState.currentPlayer = 0;
    updateTurnIndicator();
    elements.gameStatus.textContent = '本地游戏已开始，红方先手';
}

function showOnlineInput() {
    gameState.mode = 'online';
    elements.modeSelection.style.display = 'none';
    elements.roomInput.style.display = 'flex';
    elements.gameStatus.textContent = '请输入房间号加入游戏';
}

function joinOnlineGame() {
    const roomCode = document.getElementById('room-code').value.trim();
    if (!roomCode) {
        elements.gameStatus.textContent = '请输入有效的房间号';
        return;
    }
    // 这里添加联机逻辑
    elements.gameStatus.textContent = `正在加入房间 ${roomCode}...`;
}

function handleMove(row, col) {
    if (gameState.board[row][col]) return;
    
    const currentColor = gameState.colors[gameState.currentPlayer];
    gameState.board[row][col] = currentColor;
    updateBoard();
    
    if (checkWin(row, col, currentColor)) {
        setTimeout(() => {
            alert(`${gameState.colorNames[currentColor]}方获胜！`);
            resetGame();
        }, 100);
        return;
    }
    
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 3;
    updateTurnIndicator();
}

function checkWin(row, col, color) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        
        for (let i = 1; i < 4; i++) {
            const [r1, r2] = [row + i*dx, row - i*dx];
            const [c1, c2] = [col + i*dy, col - i*dy];
            
            if (r1 >= 0 && r1 < 15 && c1 >= 0 && c1 < 15 && 
                gameState.board[r1][c1] === color) count++;
            if (r2 >= 0 && r2 < 15 && c2 >= 0 && c2 < 15 && 
                gameState.board[r2][c2] === color) count++;
            
            if (count >= 4) return true;
        }
    }
    return false;
}

function updateBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        cell.className = 'cell';
        if (gameState.board[row][col]) {
            cell.classList.add(gameState.board[row][col]);
        }
    });
}

function updateTurnIndicator() {
    const currentColor = gameState.colors[gameState.currentPlayer];
    elements.currentColorDot.style.backgroundColor = currentColor;
    elements.turnText.textContent = `当前落子: ${gameState.colorNames[currentColor]}方`;
    elements.turnText.style.color = currentColor;
}

function resetGame() {
    gameState.board = Array(15).fill().map(() => Array(15).fill(null));
    gameState.currentPlayer = 0;
    updateBoard();
    updateTurnIndicator();
}

// 启动游戏
initGame();
