const socket = io("https://spotty-special-tarragon.glitch.me"); // 替换为你的Glitch域名
const board = document.getElementById('board');
const roomInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const gameStatus = document.getElementById('game-status');

let playerColor = '';
let currentTurn = 'red';
let gameBoard = Array(15).fill().map(() => Array(15).fill(null));
let isGameActive = false;

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
    if (roomCode && roomCode.length === 4) {
        socket.emit('join-room', roomCode);
        gameStatus.textContent = `正在加入房间 ${roomCode}...`;
    } else {
        gameStatus.textContent = '请输入4位房间号';
    }
});

// Socket.io 事件监听
socket.on('assign-color', (color) => {
    playerColor = color;
    gameStatus.textContent = `你是${color}方，等待其他玩家...`;
});

socket.on('game-start', (players) => {
    isGameActive = true;
    gameStatus.textContent = `游戏开始！顺序: ${players.join(' → ')}`;
    if (currentTurn === playerColor) {
        gameStatus.textContent += ' (轮到你了)';
    }
});

socket.on('move-made', (data) => {
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    currentTurn = getNextColor(color);
    if (isGameActive) {
        gameStatus.textContent = currentTurn === playerColor 
            ? `轮到你了 (${playerColor}方)` 
            : `等待${currentTurn}方落子...`;
    }
});

socket.on('game-over', (winner) => {
    isGameActive = false;
    gameStatus.textContent = `游戏结束！${winner}方获胜！`;
});

// 更新棋盘显示
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

// 落子逻辑
function makeMove(row, col) {
    if (!isGameActive || playerColor !== currentTurn || gameBoard[row][col]) return;
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

initBoard();
