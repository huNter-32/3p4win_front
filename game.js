// 游戏状态常量
const MODE = {
    LOCAL: 'local',
    ONLINE: 'online'
};

// DOM元素
const modeSelection = document.getElementById('mode-selection');
const localBtn = document.getElementById('local-btn');
const onlineBtn = document.getElementById('online-btn');
const roomInput = document.getElementById('room-input');
const turnIndicator = document.getElementById('turn-indicator');
const currentColorDot = document.getElementById('current-color-dot');
const turnText = document.getElementById('turn-text');

// 游戏状态变量
let gameMode = null;
let currentPlayerIndex = 0;
const playerColors = ['red', 'yellow', 'green'];
const colorNames = { red: '红', yellow: '黄', green: '绿' };

// 初始化游戏
function initGame() {
    // 隐藏棋盘，显示模式选择
    board.style.display = 'none';
    modeSelection.style.display = 'block';
    
    // 模式选择事件
    localBtn.addEventListener('click', () => {
        gameMode = MODE.LOCAL;
        startGame();
    });
    
    onlineBtn.addEventListener('click', () => {
        gameMode = MODE.ONLINE;
        modeSelection.style.display = 'none';
        roomInput.style.display = 'flex';
    });
    
    // 原加入房间逻辑
    joinBtn.addEventListener('click', () => {
        const roomCode = document.getElementById('room-code').value.trim();
        if (roomCode) {
            socket.emit('join-room', roomCode);
        }
    });
}

// 开始游戏（通用）
function startGame() {
    modeSelection.style.display = 'none';
    roomInput.style.display = 'none';
    board.style.display = 'grid';
    initBoard();
    updateTurnIndicator();
}

// 更新当前玩家指示器
function updateTurnIndicator() {
    const currentColor = playerColors[currentPlayerIndex];
    currentColorDot.style.backgroundColor = currentColor;
    turnText.textContent = `当前落子: ${colorNames[currentColor]}方`;
    turnText.style.color = currentColor;
}

// 修改后的落子逻辑
function makeMove(row, col) {
    if (gameBoard[row][col]) return;
    
    const currentColor = playerColors[currentPlayerIndex];
    gameBoard[row][col] = currentColor;
    
    if (gameMode === MODE.LOCAL) {
        // 本地模式：直接更新
        updateBoard();
        checkWinLocal(row, col, currentColor);
        currentPlayerIndex = (currentPlayerIndex + 1) % 3;
        updateTurnIndicator();
    } else {
        // 联机模式：发送到服务器
        socket.emit('make-move', { 
            row, col, 
            color: currentColor,
            room: roomInput.value.trim()
        });
    }
}

// 本地胜利检查
function checkWinLocal(row, col, color) {
    if (checkWin(gameBoard, row, col, color)) {
        setTimeout(() => {
            alert(`${colorNames[color]}方获胜！`);
            resetGame();
        }, 100);
    }
}

// 重置游戏
function resetGame() {
    gameBoard = Array(15).fill().map(() => Array(15).fill(null));
    currentPlayerIndex = 0;
    updateBoard();
    updateTurnIndicator();
}

// 原socket.io相关代码保持不变，但增加模式判断
socket.on('move-made', (data) => {
    if (gameMode !== MODE.ONLINE) return;
    
    const { row, col, color } = data;
    gameBoard[row][col] = color;
    updateBoard();
    
    // 联机模式下由服务器控制回合
    currentPlayerIndex = playerColors.indexOf(color);
    updateTurnIndicator();
});

// 初始化
initGame();
