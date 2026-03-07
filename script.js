(function() {
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
        turnIndicator.textContent = turn === 'w' ? 'Ход белых (синие)' : 'Ход чёрных (фиолетовые)';
        if (game.game_over()) {
            if (game.in_checkmate()) {
                const loser = turn === 'w' ? 'Чёрные (фиолетовые)' : 'Белые (синие)';
                gameOverMsg.textContent = `⚡ МАТ! ${loser} победили ⚡`;
            } else if (game.in_stalemate()) gameOverMsg.textContent = 'ПАТ';
            else if (game.in_threefold_repetition()) gameOverMsg.textContent = 'ПОВТОР';
            else if (game.insufficient_material()) gameOverMsg.textContent = 'НЕДОСТАТОЧНО ФИГУР';
            else if (game.in_draw()) gameOverMsg.textContent = 'НИЧЬЯ';
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
        game.reset();
        clearSelection();
        isBotMoving = false;
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

    renderBoard();
})();