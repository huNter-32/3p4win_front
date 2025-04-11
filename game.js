const socket = io(https://spotty-special-tarragon.glitch.me);
const board = document.getElementById('board');
const roomInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const gameStatus = document.getElementById('game-status');
const playerTags = document.querySelectorAll('.player-tag');

let playerColor = '';
let currentTurn = 'red';
let gameBoard = Array(15).fill().map(() => Array(15).fill(null));

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
    const roomCode = roomInput.value.trim();
    if (roomCode) {
        socket.emit('join-room', roomCode);
        gameStatus.textContent = `正在加入房间 ${roomCode}...`;
    }
});

// 服务器通信
socket.on('assign-color', (color) => {
    playerColor = color;
    
    // 高亮显示当前玩家
    playerTags.forEach(tag => {
        tag.classList.remove('you');
        if (tag.classList.contains(color)) {
            tag.classList.add('you');
        }
    });
    
    gameStatus.textContent = `你是${getColorName(color)}方，等待游戏开始...`;
});

socket.on('game-start', (players) => {
    gameStatus.textContent = `游戏开始！当前回合：红方`;
    updatePlayerTags(players);
});

socket.on('move-made', (data) => {
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    currentTurn = getNextColor(color);
    gameStatus.textContent = `当前回合：${getColorName(currentTurn)}方`;
    
    // 更新玩家标签的高亮状态
    playerTags.forEach(tag => {
        tag.classList.remove('current-turn');
        if (tag.classList.contains(currentTurn)) {
            tag.classList.add('current-turn');
        }
    });
});

socket.on('game-over', (winner) => {
    gameStatus.textContent = `游戏结束！${getColorName(winner)}方获胜！`;
    
    // 标记获胜的棋子
    document.querySelectorAll('.cell').forEach(cell => {
        if (cell.classList.contains(winner)) {
            cell.classList.add('winning-cell');
        }
    });
    
    // 高亮显示获胜玩家
    playerTags.forEach(tag => {
        tag.classList.remove('current-turn');
        if (tag.classList.contains(winner)) {
            tag.classList.add('current-turn');
        }
    });
});

socket.on('room-full', () => {
    gameStatus.textContent = '房间已满，请尝试其他房间号';
});

socket.on('disconnect', () => {
    gameStatus.textContent = '与服务器断开连接';
});

// 更新棋盘显示
function updateBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.className = 'cell'; // 重置类名
        
        if (gameBoard[row][col]) {
            cell.classList.add(gameBoard[row][col]);
        }
    });
}

// 落子逻辑
function makeMove(row, col) {
    if (playerColor !== currentTurn || gameBoard[row][col]) return;
    
    socket.emit('make-move', { 
        row, 
        col, 
        color: playerColor,
        room: roomInput.value.trim()
    });
}

// 计算下一个玩家
function getNextColor(current) {
    const colors = ['red', 'yellow', 'green'];
    const currentIndex = colors.indexOf(current);
    return colors[(currentIndex + 1) % colors.length];
}

// 获取颜色名称
function getColorName(color) {
    const names = {
        'red': '红',
        'yellow': '黄',
        'green': '绿'
    };
    return names[color] || color;
}

// 更新玩家标签状态
function updatePlayerTags(players) {
    playerTags.forEach(tag => {
        const color = tag.classList[1]; // 获取颜色类名
        const isActive = players.includes(color);
        tag.style.opacity = isActive ? '1' : '0.5';
    });
}

initBoard();
