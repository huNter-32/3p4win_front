const socket = io("https://tranquil-rugelach-7db296.netlify.app/"); 
const board = document.getElementById('board');
const roomInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const gameStatus = document.getElementById('game-status');
const playerTags = document.querySelectorAll('.player-tag');

let playerColor = '';
let currentTurn = 'red';
let gameBoard = Array(15).fill().map(() => Array(15).fill(null));
let roomCode = '';

// 初始化棋盘
function initBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => makeMove(row, col));
            board.appendChild(cell);
        }
    }
}

// 加入房间
joinBtn.addEventListener('click', () => {
    roomCode = roomInput.value.trim();
    if (roomCode) {
        gameStatus.textContent = `正在加入房间 ${roomCode}...`;
        socket.emit('join-room', roomCode);
    } else {
        gameStatus.textContent = '请输入有效的房间号';
    }
});

// ================= 服务器通信处理 =================
socket.on('connect', () => {
    gameStatus.textContent = roomCode ? `正在加入房间 ${roomCode}...` : '已连接到服务器，请输入房间号';
});

socket.on('disconnect', () => {
    gameStatus.textContent = '与服务器断开连接，请刷新页面';
});

socket.on('connect_error', (err) => {
    gameStatus.textContent = `连接失败: ${err.message}`;
    console.error('连接错误:', err);
});

socket.on('assign-color', (color) => {
    playerColor = color;
    updatePlayerUI();
    gameStatus.textContent = `你是${getColorName(color)}方，等待其他玩家加入...`;
});

socket.on('game-start', (players) => {
    updatePlayerUI(players);
    currentTurn = 'red';
    gameStatus.textContent = `游戏开始！当前回合：红方`;
    highlightCurrentPlayer();
});

socket.on('move-made', (data) => {
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    currentTurn = getNextColor(color);
    gameStatus.textContent = `当前回合：${getColorName(currentTurn)}方`;
    highlightCurrentPlayer();
});

socket.on('game-over', (winner) => {
    gameStatus.textContent = `游戏结束！${getColorName(winner)}方获胜！`;
    highlightWinningCells(winner);
    highlightCurrentPlayer(winner);
});

socket.on('room-full', () => {
    gameStatus.textContent = '房间已满，请尝试其他房间号';
});

socket.on('player-joined', (players) => {
    updatePlayerUI(players);
    gameStatus.textContent = `玩家已加入，当前玩家: ${players.map(getColorName).join(', ')}`;
});

socket.on('player-left', (players) => {
    updatePlayerUI(players);
    gameStatus.textContent = `玩家退出，等待重新连接...`;
});

// ================= 游戏逻辑函数 =================
function makeMove(row, col) {
    if (playerColor !== currentTurn || gameBoard[row][col]) return;
    
    socket.emit('make-move', { 
        row, 
        col, 
        color: playerColor,
        room: roomCode
    });
}

function updateBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.className = 'cell';
        
        if (gameBoard[row][col]) {
            cell.classList.add(gameBoard[row][col]);
        }
    });
}

function getNextColor(current) {
    const colors = ['red', 'yellow', 'green'];
    const currentIndex = colors.indexOf(current);
    return colors[(currentIndex + 1) % colors.length];
}

function getColorName(color) {
    const names = { red: '红', yellow: '黄', green: '绿' };
    return names[color] || color;
}

// ================= UI更新函数 =================
function updatePlayerUI(activePlayers) {
    playerTags.forEach(tag => {
        const color = tag.classList[1];
        
        // 重置状态
        tag.classList.remove('you', 'current-turn');
        tag.style.opacity = '1';
        
        // 标记当前玩家
        if (color === playerColor) {
            tag.classList.add('you');
        }
        
        // 标记非活跃玩家
        if (activePlayers && !activePlayers.includes(color)) {
            tag.style.opacity = '0.3';
        }
    });
}

function highlightCurrentPlayer(color = currentTurn) {
    playerTags.forEach(tag => {
        tag.classList.remove('current-turn');
        if (tag.classList.contains(color)) {
            tag.classList.add('current-turn');
        }
    });
}

function highlightWinningCells(winner) {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('winning-cell');
        if (cell.classList.contains(winner)) {
            cell.classList.add('winning-cell');
        }
    });
}

// 初始化游戏
initBoard();
