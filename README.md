# ♟️ Chess Arena

A **real-time multiplayer chess game** with **live chat**, built using **Node.js, Express, Socket.IO, and Chess.js**, and deployed on AWS.

---

## 🌐 Live Demo

🚀 Play here:
👉 http://chess-game-657530530.ap-northeast-1.elb.amazonaws.com/

> ⚠️ Note: Currently running on HTTP. Some browsers may attempt HTTPS automatically.

---

## 🚀 Features

### 🎮 Real-Time Multiplayer

* Play chess with other users across devices
* Instant move synchronization using Socket.IO
* Automatic player roles (White / Black / Spectator)

### 💬 Live Chat System

* Built-in real-time chat
* Players and spectators can communicate
* Messages broadcast instantly (no refresh needed)

### 👥 Player Management

* Dynamic player & spectator tracking
* Handles user disconnects gracefully

### 🎨 UI/UX

* Clean and professional interface
* Responsive design for desktop & mobile

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Realtime:** Socket.IO
* **Chess Engine:** Chess.js
* **Templating:** EJS
* **Deployment:** Docker + AWS (ECS + Load Balancer)

---

## 📂 Project Structure

```
chess-arena/
├── index.js
├── public/
│   └── Js/
│       └── chessgame.js
├── views/
│   └── index.ejs
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## ⚙️ Local Development

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/chess-arena.git
cd chess-arena
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Server

```bash
npm start
```

👉 Open: http://localhost:3000

---

## 🐳 Run with Docker

```bash
docker-compose up --build
```

---

## 💬 Chat Feature (Real-Time)

### Client → Server

```js
socket.emit("chatMessage", message);
```

### Server → All Clients

```js
socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
});
```

### Receive Message

```js
socket.on("chatMessage", (msg) => {
    // Display message in chat UI
});
```

✔ Works across devices
✔ No refresh required
✔ Uses WebSockets via Socket.IO

---

## ☁️ AWS Deployment

The application is deployed using:

* AWS ECS (Elastic Container Service)
* AWS ECR (Container Registry)
* AWS Application Load Balancer

### Deployment Flow

1. Build Docker image
2. Push to ECR
3. Run via ECS service
4. Expose using Load Balancer

---

## ⚠️ Important Notes

* This project requires a backend → cannot run fully on Netlify alone
* HTTPS is not configured yet (recommended for production)
* All users currently join the same game session

---

## 🔮 Future Improvements

* 🔐 User authentication (login/signup)
* 🎯 Matchmaking & private rooms
* 📊 Game history tracking
* 🌍 Custom domain + HTTPS
* 🧠 AI opponent mode

---

## 🔌 Socket.IO Events

### Client → Server

* `playerJoined`
* `move`
* `chatMessage`
* `disconnect`

### Server → Client

* `playerRole`
* `boardState`
* `chatMessage`
* `playersUpdate`

---

## 📜 License

ISC

---

## ⭐ Support

If you like this project, consider giving it a star ⭐ on GitHub!
