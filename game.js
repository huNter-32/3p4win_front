const socket = io("https://your-project-name.glitch.me");
const board = document.getElementById('board');
const roomInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const gameStatus = document.getElementById('game-status');

let playerColor = '';
let currentTurn = 'red'; // 红黄绿轮流
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
    }
});

// 服务器通信
socket.on('assign-color', (color) => {
    playerColor = color;
    gameStatus.textContent = `你是${color}方，等待游戏开始...`;
});

socket.on('game-start', (players) => {
    gameStatus.textContent = `游戏开始！玩家: ${players.join(', ')}`;
});

socket.on('move-made', (data) => {
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    currentTurn = getNextColor(color);
    if (color !== playerColor) {
        gameStatus.textContent = `轮到${currentTurn}方落子`;
    }
});

socket.on('game-over', (winner) => {
    gameStatus.textContent = `游戏结束！${winner}方获胜！`;
});

// 更新棋盘显示
function updateBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (gameBoard[row][col]) {
            cell.className = `cell ${gameBoard[row][col]}`;
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

initBoard();
