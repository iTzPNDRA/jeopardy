// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// 1) Express-App + HTTP-Server erzeugen
const app = express();
const server = http.createServer(app);

// 2) Socket.io an den HTTP-Server binden
const io = new Server(server);

// 3) Statische Dateien: Falls dein Projekt im selben Ordner liegt
app.use(express.static(path.join(__dirname)));

// 4) In-Memory-Spielzustand
let globalState = {
  categories: [],    // Array deiner Kategorien
  players: [],       // Array deiner Spieler {name, score}
  finalJeopardyQuestion: "",
  finalJeopardyAnswer: "",
  isFinalJeopardyActive: false
  // ggf. mehr Felder (z.B. currentQuestion, timer, etc.)
};

// ================================
//  Socket.io: Client-Verbindungen
// ================================
io.on("connection", (socket) => {
  console.log("Client verbunden:", socket.id);

  // 1) Client will aktuellen Spielzustand
  socket.on("requestState", () => {
    socket.emit("updateState", globalState);
  });

  // 2) "initGame" – Spielzustand initial setzen
  //    z. B. wenn du categories/players/finalJeopardy aus dem Client schickst
  socket.on("initGame", (payload) => {
    // payload: { categories, players, finalJeopardyQuestion, finalJeopardyAnswer, ... }
    if (payload.categories) {
      globalState.categories = payload.categories;
    }
    if (payload.players) {
      globalState.players = payload.players;
    }
    if (payload.finalJeopardyQuestion) {
      globalState.finalJeopardyQuestion = payload.finalJeopardyQuestion;
    }
    if (payload.finalJeopardyAnswer) {
      globalState.finalJeopardyAnswer = payload.finalJeopardyAnswer;
    }
    // etc.

    // Broadcast an alle
    io.emit("updateState", globalState);
  });

  // 3) Frage öffnen
  socket.on("openQuestion", (payload) => {
    // payload: { catIndex, qIndex }
    const { catIndex, qIndex } = payload;
    if (!globalState.categories[catIndex]) return;
    if (!globalState.categories[catIndex].questions[qIndex]) return;

    // Du könntest z. B. "isOpen" oder "currentQuestion" setzen
    globalState.categories[catIndex].questions[qIndex].isOpen = true;

    // Update an alle
    io.emit("updateState", globalState);
  });

  // 4) Richtig beantwortet
  socket.on("answerCorrect", (payload) => {
    // payload: { catIndex, qIndex, playerIndex }
    const { catIndex, qIndex, playerIndex } = payload;
    const questionObj = globalState.categories[catIndex].questions[qIndex];

    // Score erhöhen
    globalState.players[playerIndex].score += questionObj.value;
    // Frage "used"
    questionObj.used = true;
    questionObj.isOpen = false; // optional

    io.emit("updateState", globalState);
  });

  // 5) Falsch beantwortet
  socket.on("answerWrong", (payload) => {
    const { catIndex, qIndex, playerIndex } = payload;
    const questionObj = globalState.categories[catIndex].questions[qIndex];

    globalState.players[playerIndex].score -= questionObj.value;
    // Frage bleibt "unused" oder isOpen = true (je nach Logik)
    // ...

    io.emit("updateState", globalState);
  });

  // NEU: Frage manuell schließen
  socket.on("closeQuestionCompletely", (payload) => {
    // payload: { catIndex, qIndex }
    const { catIndex, qIndex } = payload;
    const questionObj = globalState.categories[catIndex].questions[qIndex];

    questionObj.used = true;
    questionObj.isOpen = false;

    io.emit("updateState", globalState);
  });

  // OPTIONAL: Start Final Jeopardy
  socket.on("startFinalJeopardy", () => {
    globalState.isFinalJeopardyActive = true;
    io.emit("updateState", globalState);
  });

  // OPTIONAL: End Final Jeopardy
  socket.on("endFinalJeopardy", () => {
    globalState.isFinalJeopardyActive = false;
    io.emit("updateState", globalState);
  });

  // 6) Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ================================
// Server starten
// ================================
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
