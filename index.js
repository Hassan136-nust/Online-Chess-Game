const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();
const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let chess = new Chess();
let players = { white: null, black: null };
let spectators = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("playerJoined", (data) => {
        const playerName = data.name || "Anonymous";

        if (!players.white) {
            players.white = { id: socket.id, name: playerName };
            socket.emit("playerRole", "white");
        } else if (!players.black) {
            players.black = { id: socket.id, name: playerName };
            socket.emit("playerRole", "black");
        } else {
            spectators.push({ id: socket.id, name: playerName });
            socket.emit("spectatorRole");
        }

        io.emit("playersUpdate", players);
        io.emit("spectatorsUpdate", spectators);
        socket.emit("boardState", chess.fen());
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);

        let playerLeft = false;

        if (players.white && players.white.id === socket.id) {
            players.white = null;
            playerLeft = true;
        } else if (players.black && players.black.id === socket.id) {
            players.black = null;
            playerLeft = true;
        } else {
            spectators = spectators.filter(s => s.id !== socket.id);
        }

        // If a player left, announce draw and reset
        if (playerLeft) {
            io.emit("gameDraw", { message: "Match Draw - Player disconnected" });
            chess = new Chess();
        }

        io.emit("playersUpdate", players);
        io.emit("spectatorsUpdate", spectators);
        io.emit("boardState", chess.fen());
    });

    socket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && (!players.white || socket.id !== players.white.id)) return;
            if (chess.turn() === "b" && (!players.black || socket.id !== players.black.id)) return;

            const result = chess.move(move);
            if (result) {
                io.emit("boardState", chess.fen());
            } else {
                socket.emit("invalidMove", move);
            }
        } catch (err) {
            socket.emit("invalidMove");
        }
    });

    socket.on("chatMessage", (message) => {
        io.emit("chatMessage", message);
    });
});

server.listen(PORT, () => {
    console.log(`Chess Arena started on port ${PORT}`);
});
