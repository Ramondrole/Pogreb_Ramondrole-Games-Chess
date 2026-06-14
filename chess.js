const chessTranslations = {
    ru: {
        friendMode: "ДРУГ",
        botMode: "БОТ",
        whiteTurn: "Ход белых",
        blackTurn: "Ход чёрных",
        blueLegend: "Синие",
        purpleLegend: "Фиолетовые",
        blueDesc: "— белые (ходят первыми)",
        purpleDesc: "— чёрные",
        newGameBtn: "НОВАЯ ИГРА",
        mateWhiteWin: "МАТ! Белые победили",
        mateBlackWin: "МАТ! Чёрные победили",
        stalemate: "ПАТ",
        repetition: "ПОВТОР",
        insufficient: "НЕДОСТАТОЧНО ФИГУР",
        draw: "НИЧЬЯ",
        about: "Обо мне",
        games: "Наши игры",
        functions: "Полезные функции"
    },
    en: {
        friendMode: "FRIEND",
        botMode: "BOT",
        whiteTurn: "White's turn",
        blackTurn: "Black's turn",
        blueLegend: "Blue",
        purpleLegend: "Purple",
        blueDesc: "— white (move first)",
        purpleDesc: "— black",
        newGameBtn: "NEW GAME",
        mateWhiteWin: "CHECKMATE! White wins",
        mateBlackWin: "CHECKMATE! Black wins",
        stalemate: "STALEMATE",
        repetition: "REPETITION",
        insufficient: "INSUFFICIENT MATERIAL",
        draw: "DRAW",
        about: "About me",
        games: "Our games",
        functions: "Useful functions"
    },
    de: {
        friendMode: "FREUND",
        botMode: "BOT",
        whiteTurn: "Weiß am Zug",
        blackTurn: "Schwarz am Zug",
        blueLegend: "Blau",
        purpleLegend: "Lila",
        blueDesc: "— Weiß (zieht zuerst)",
        purpleDesc: "— Schwarz",
        newGameBtn: "NEUES SPIEL",
        mateWhiteWin: "SCHACHMATT! Weiß gewinnt",
        mateBlackWin: "SCHACHMATT! Schwarz gewinnt",
        stalemate: "PATT",
        repetition: "WIEDERHOLUNG",
        insufficient: "UNZUREICHENDES MATERIAL",
        draw: "UNENTSCHIEDEN",
        about: "Über mich",
        games: "Unsere Spiele",
        functions: "Nützliche Funktionen"
    }
};

let currentLang = localStorage.getItem('chess_language') || 'ru';

function t(key, replacements = {}) {
    let text = chessTranslations[currentLang]?.[key] || chessTranslations.ru[key];
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

function updateChessUILanguage() {
    const elements = ['friendMode', 'botMode', 'blueLegend', 'purpleLegend', 'blueDesc', 'purpleDesc', 'newGameBtn'];
    elements.forEach(key => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el) el.textContent = t(key);
    });
    
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        const flags = { ru: '🌐 RU', en: '🌐 EN', de: '🌐 DE' };
        langBtn.innerHTML = flags[currentLang];
    }
    
    document.querySelectorAll('.nav-links a').forEach((link, idx) => {
        const keys = ['about', 'games', 'functions'];
        if (idx < keys.length) link.textContent = t(keys[idx]);
    });
    
    const turn = game?.turn();
    if (turn && !game?.game_over()) {
        turnIndicator.textContent = turn === 'w' ? t('whiteTurn') : t('blackTurn');
    }
}

const boardEl = document.getElementById('chessboard');
const turnIndicator = document.getElementById('turnIndicator');
const gameOverMsg = document.getElementById('gameOverMsg');
const modeFriendBtn = document.getElementById('modeFriend');
const modeBotBtn = document.getElementById('modeBot');
const newGameBtn = document.getElementById('newGameBtn');

let game = new Chess();
let selectedSquare = null;
let possibleMoves = [];
let mode = 'friend';
let isBotMoving = false;

const pieceSymbols = {
    'p': { 'w': '♙', 'b': '♟' },
    'n': { 'w': '♘', 'b': '♞' },
    'b': { 'w': '♗', 'b': '♝' },
    'r': { 'w': '♖', 'b': '♜' },
    'q': { 'w': '♕', 'b': '♛' },
    'k': { 'w': '♔', 'b': '♚' }
};

function renderBoard() {
    boardEl.innerHTML = '';
    const boardState = game.board();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            const squareDiv = document.createElement('div');
            squareDiv.className = 'square';
            const isLight = (row + col) % 2 === 0;
            squareDiv.classList.add(isLight ? 'light' : 'dark');
            if (piece) {
                const symbol = pieceSymbols[piece.type][piece.color];
                squareDiv.textContent = symbol;
                squareDiv.classList.add('has-piece');
                if (piece.color === 'w') {
                    squareDiv.classList.add('white-piece');
                } else {
                    squareDiv.classList.add('black-piece');
                }
            }
            const file = String.fromCharCode(97 + col);
            const rank = 8 - row;
            const squareNotation = file + rank;
            squareDiv.dataset.row = row;
            squareDiv.dataset.col = col;
            squareDiv.dataset.square = squareNotation;
            if (selectedSquare === squareNotation) {
                squareDiv.classList.add('selected');
            }
            if (possibleMoves.includes(squareNotation)) {
                squareDiv.classList.add('possible-move');
            }
            squareDiv.addEventListener('click', onSquareClick);
            boardEl.appendChild(squareDiv);
        }
    }
    updateStatus();
}

function updateStatus() {
    const turn = game.turn();
    if (!game.game_over()) {
        turnIndicator.textContent = turn === 'w' ? t('whiteTurn') : t('blackTurn');
    }
    
    if (game.game_over()) {
        if (game.in_checkmate()) {
            const loser = turn === 'w' ? 'black' : 'white';
            if (loser === 'white') {
                gameOverMsg.textContent = t('mateBlackWin');
            } else {
                gameOverMsg.textContent = t('mateWhiteWin');
            }
        } else if (game.in_stalemate()) gameOverMsg.textContent = t('stalemate');
        else if (game.in_threefold_repetition()) gameOverMsg.textContent = t('repetition');
        else if (game.insufficient_material()) gameOverMsg.textContent = t('insufficient');
        else if (game.in_draw()) gameOverMsg.textContent = t('draw');
    } else {
        gameOverMsg.textContent = '';
    }
}

function onSquareClick(event) {
    if (isBotMoving || game.game_over()) return;
    const squareDiv = event.currentTarget;
    const square = squareDiv.dataset.square;
    const row = parseInt(squareDiv.dataset.row);
    const col = parseInt(squareDiv.dataset.col);
    const piece = game.board()[row][col];
    
    if (selectedSquare === null) {
        if (piece && piece.color === game.turn()) {
            selectSquare(square);
        }
        return;
    }
    
    if (selectedSquare === square) {
        clearSelection();
        return;
    }
    
    if (possibleMoves.includes(square)) {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
        });
        if (move) {
            clearSelection();
            renderBoard();
            if (mode === 'bot' && game.turn() === 'b' && !game.game_over() && !isBotMoving) {
                triggerBotMove();
            }
        } else {
            clearSelection();
        }
        return;
    }
    
    if (piece && piece.color === game.turn()) {
        selectSquare(square);
    } else {
        clearSelection();
    }
}

function selectSquare(square) {
    selectedSquare = square;
    const moves = game.moves({ square: square, verbose: true });
    possibleMoves = moves.map(m => m.to);
    renderBoard();
}

function clearSelection() {
    selectedSquare = null;
    possibleMoves = [];
    renderBoard();
}

function triggerBotMove() {
    if (isBotMoving) return;
    isBotMoving = true;
    setTimeout(() => {
        if (game.game_over() || game.turn() !== 'b') {
            isBotMoving = false;
            return;
        }
        const allMoves = game.moves({ verbose: true });
        if (allMoves.length > 0) {
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            game.move({ from: randomMove.from, to: randomMove.to, promotion: 'q' });
        }
        clearSelection();
        isBotMoving = false;
    }, 300);
}

function resetGame() {
    game = new Chess();
    clearSelection();
    isBotMoving = false;
    renderBoard();
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('chess_language', lang);
    updateChessUILanguage();
    renderBoard();
}

modeFriendBtn.addEventListener('click', () => {
    mode = 'friend';
    modeFriendBtn.classList.add('active');
    modeBotBtn.classList.remove('active');
    resetGame();
});

modeBotBtn.addEventListener('click', () => {
    mode = 'bot';
    modeBotBtn.classList.add('active');
    modeFriendBtn.classList.remove('active');
    resetGame();
});

newGameBtn.addEventListener('click', resetGame);

document.querySelectorAll('.lang-dropdown a').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = item.getAttribute('data-lang');
        if (lang) changeLanguage(lang);
    });
});

updateChessUILanguage();
renderBoard();