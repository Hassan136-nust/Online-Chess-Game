const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");
const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const chatText = document.querySelector("#chatText");
const nameModal = document.querySelector("#nameModal");
const gameContainer = document.querySelector("#gameContainer");
const playerNameInput = document.querySelector("#playerNameInput");
const startGameBtn = document.querySelector("#startGameBtn");
const playersContainer = document.querySelector("#playersContainer");
const spectatorsContainer = document.querySelector("#spectatorsContainer");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let playerName = null;
let players = { white: null, black: null };
let spectators = [];

const toSquare = (row, col) => {
    return `${String.fromCharCode(97 + col)}${8 - row}`;
};

startGameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert("Please enter your name");
        return;
    }
    playerName = name;
    nameModal.classList.remove("active");
    gameContainer.classList.remove("hidden");
    socket.emit("playerJoined", { name });
});

playerNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") startGameBtn.click();
});

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerHTML = getPieceUnicode(square);
                pieceElement.draggable = playerRole && playerRole === (square.color === "w" ? "white" : "black");

                pieceElement.addEventListener("dragstart", () => {
                    draggedPiece = pieceElement;
                    sourceSquare = { row: rowIndex, col: squareIndex };
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (!draggedPiece || !sourceSquare) return;

                const targetSquare = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                };

                const move = {
                    from: toSquare(sourceSquare.row, sourceSquare.col),
                    to: toSquare(targetSquare.row, targetSquare.col),
                    promotion: "q",
                };

                const result = chess.move(move);
                if (result) {
                    renderBoard();
                    socket.emit("move", move);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙",
        K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟",
    };
    return piece.color === "w" ? unicodePieces[piece.type] : unicodePieces[piece.type.toUpperCase()];
};

const updatePlayersDisplay = () => {
    playersContainer.innerHTML = "";
    if (players.white) {
        playersContainer.innerHTML += `
            <div class="player-info">
                <div class="player-badge white">W</div>
                <div class="player-info-text">
                    <div class="player-name">${players.white.name}</div>
                    <div class="player-role">White Player</div>
                </div>
            </div>
        `;
    }
    if (players.black) {
        playersContainer.innerHTML += `
            <div class="player-info">
                <div class="player-badge black">B</div>
                <div class="player-info-text">
                    <div class="player-name">${players.black.name}</div>
                    <div class="player-role">Black Player</div>
                </div>
            </div>
        `;
    }
    if (!players.white && !players.black) {
        playersContainer.innerHTML = '<div style="color: #9a8f87;" class="text-sm">Waiting for players...</div>';
    }
};

const updateSpectatorsDisplay = () => {
    spectatorsContainer.innerHTML = "";
    if (spectators.length === 0) {
        spectatorsContainer.innerHTML = '<div style="color: #9a8f87;" class="text-sm">No spectators yet</div>';
        return;
    }
    spectators.forEach(spectator => {
        spectatorsContainer.innerHTML += `
            <div class="player-info">
                <div class="player-badge spectator">👁</div>
                <div class="player-info-text">
                    <div class="player-name">${spectator.name}</div>
                    <div class="player-role">Spectator</div>
                </div>
            </div>
        `;
    });
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("playersUpdate", (playersData) => {
    players = playersData;
    updatePlayersDisplay();
});

socket.on("spectatorsUpdate", (spectatorsData) => {
    spectators = spectatorsData;
    updateSpectatorsDisplay();
});

socket.on("gameDraw", (data) => {
    const msg = document.createElement("div");
    msg.className = "chat-message";
    msg.style.borderLeftColor = "#e74c3c";
    msg.innerHTML = `<div style="color: #e74c3c; font-weight: 600;">⚠️ ${data.message}</div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("chatMessage", (message) => {
    const msg = document.createElement("div");
    msg.className = "chat-message";
    msg.innerHTML = `
        <div><span class="chat-message-sender">${message.sender}</span> <span class="chat-message-time">${message.time}</span></div>
        <div class="chat-message-text">${message.text}</div>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatText.value.trim();
    if (!text) return;
    const message = { sender: playerName, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    socket.emit("chatMessage", message);
    chatText.value = "";
});

renderBoard();
