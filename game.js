const socket = io();
const board = document.getElementById('board');
const roomInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const gameStatus = document.getElementById('game-status');

let playerColor = '';
let currentTurn = 'red'; // ���������
let gameBoard = Array(15).fill().map(() => Array(15).fill(null));

// ��ʼ������
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

// ���뷿��
joinBtn.addEventListener('click', () => {
    const roomCode = roomInput.value.trim();
    if (roomCode) {
        socket.emit('join-room', roomCode);
    }
});

// ������ͨ��
socket.on('assign-color', (color) => {
    playerColor = color;
    gameStatus.textContent = `����${color}�����ȴ���Ϸ��ʼ...`;
});

socket.on('game-start', (players) => {
    gameStatus.textContent = `��Ϸ��ʼ�����: ${players.join(', ')}`;
});

socket.on('move-made', (data) => {
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    currentTurn = getNextColor(color);
    if (color !== playerColor) {
        gameStatus.textContent = `�ֵ�${currentTurn}������`;
    }
});

socket.on('game-over', (winner) => {
    gameStatus.textContent = `��Ϸ������${winner}����ʤ��`;
});

// ����������ʾ
function updateBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (gameBoard[row][col]) {
            cell.className = `cell ${gameBoard[row][col]}`;
        }
    });
}

// �����߼�
function makeMove(row, col) {
    if (playerColor !== currentTurn || gameBoard[row][col]) return;

    socket.emit('make-move', {
        row,
        col,
        color: playerColor,
        room: roomInput.value.trim()
    });
}

// ������һ�����
function getNextColor(current) {
    const colors = ['red', 'yellow', 'green'];
    const currentIndex = colors.indexOf(current);
    return colors[(currentIndex + 1) % colors.length];
}

initBoard();