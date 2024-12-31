// =========================
// script.js (Socket.io Version)
// =========================

// Socket.io-Verbindung herstellen
// (Voraussetzung: server.js stellt /socket.io/socket.io.js bereit)
const socket = io();

// Lokaler "Abbild"-State (wird vom Server aktualisiert)
let localPlayers = [];
let localCategories = [];
let localFinalJeopardyQuestion = "";
let localFinalJeopardyAnswer = "";

// Hilfsvariablen
let currentQuestion = null;         // { catIndex, qIndex }
let isFinalJeopardyActive = false;
let wagers = [];
let timerId = null;
let countdown = 0;

// Audio-Objekt für Frage-Sounds, Buzzer etc.
let questionSound = null;

// DOM-Elemente
const scoreboardEl           = document.getElementById("scoreboard");
const categoryBoardEl        = document.getElementById("categoryBoard");
const questionModalBackdrop  = document.getElementById("questionModalBackdrop");
const questionTextEl         = document.getElementById("questionText");
const questionImageEl        = document.getElementById("questionImage");
const startTimerBtn          = document.getElementById("startTimerBtn");
const timerDisplayEl         = document.getElementById("timerDisplay");
const revealAnswerBtn        = document.getElementById("revealAnswerBtn");
const answerContainerEl      = document.getElementById("answerContainer");
const answerTextEl           = document.getElementById("answerText");
const answerImageEl          = document.getElementById("answerImage");
const correctBtn             = document.getElementById("correctBtn");
const incorrectBtn           = document.getElementById("incorrectBtn");
const closeQuestionBtn       = document.getElementById("closeQuestionBtn");
const closeModalBtn          = document.getElementById("closeModalBtn");
const playerSelectEl         = document.getElementById("playerSelect");
const finalJeopardyBtn       = document.getElementById("finalJeopardyBtn");
const finalJeopardySection   = document.getElementById("finalJeopardySection");
const finalQuestionTextEl    = document.getElementById("finalQuestionText");
const wagerSectionEl         = document.getElementById("wagerSection");
const revealFinalAnswerBtn   = document.getElementById("revealFinalAnswerBtn");
const finalAnswerSectionEl   = document.getElementById("finalAnswerSection");
const finalAnswerTextEl      = document.getElementById("finalAnswerText");
const finalCheckSectionEl    = document.getElementById("finalCheckSection");
const endFinalJeopardyBtn    = document.getElementById("endFinalJeopardyBtn");
const playQuestionSoundBtn   = document.getElementById("playQuestionSoundBtn");

// Sound-Elemente aus HTML
const buzzerSoundEl  = document.getElementById("buzzerSound");
const correctSoundEl = document.getElementById("correctSound");


// ===============================
// 1) Socket.io-Event-Handling
// ===============================

// Beim Laden: Wir fordern den aktuellen State an
socket.emit("requestState");

// Wenn der Server uns den Spielzustand schickt
socket.on("updateState", (serverState) => {
  //  serverState = { categories, players, finalJeopardyQuestion, finalJeopardyAnswer, ... }
  localCategories = serverState.categories || [];
  localPlayers    = serverState.players || [];
  localFinalJeopardyQuestion = serverState.finalJeopardyQuestion || "";
  localFinalJeopardyAnswer   = serverState.finalJeopardyAnswer   || "";

  // Wir aktualisieren unser UI
  renderScoreboard();
  renderCategoryBoard();

  // Falls das Modal eine Frage zeigt, könnten wir checken,
  // ob der Server sie inzwischen geschlossen hat (optional).
});

// Falls wir z. B. Meldungen vom Server bekommen wollen
socket.on("serverMessage", (msg) => {
  console.log("Server sagt:", msg);
});


// ===============================
// 2) Init-Funktion (optional)
// ===============================
function initGame() {
  // Du könntest hier z. B. den Server "initGame" schicken, 
  // falls du local categories & players aus questions.js
  // hochladen willst (nur Host).
  /*
  socket.emit("initGame", {
    categories,
    players,
    finalJeopardyQuestion,
    finalJeopardyAnswer
  });
  */
}

// ===============================
// 3) RENDER-FUNKTIONEN
// ===============================
function renderScoreboard() {
  scoreboardEl.innerHTML = "";
  localPlayers.forEach((player, idx) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "scoreboard-player";

    const nameSpan = document.createElement("span");
    nameSpan.className = "player-name";
    nameSpan.textContent = player.name;

    const scoreSpan = document.createElement("span");
    scoreSpan.className = "player-score";
    scoreSpan.textContent = player.score;

    playerDiv.appendChild(nameSpan);
    playerDiv.appendChild(scoreSpan);
    scoreboardEl.appendChild(playerDiv);
  });
}

function renderCategoryBoard() {
  categoryBoardEl.innerHTML = "";
  localCategories.forEach((cat, catIndex) => {
    const columnDiv = document.createElement("div");
    columnDiv.className = "category-column";

    const titleDiv = document.createElement("div");
    titleDiv.className = "category-title";
    titleDiv.textContent = cat.title;
    columnDiv.appendChild(titleDiv);

    cat.questions.forEach((q, qIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = "question-cell";
      cellDiv.textContent = `$${q.value}`;

      if (q.used) {
        // Grau machen & inaktiv
        cellDiv.classList.add("used");
        cellDiv.style.pointerEvents = "none";
      } else {
        // Klick -> Wir schicken dem Server "openQuestion"
        cellDiv.addEventListener("click", () => openQuestion(catIndex, qIndex));
      }
      columnDiv.appendChild(cellDiv);
    });

    categoryBoardEl.appendChild(columnDiv);
  });
}


// ===============================
// 4) FRAGEN-MODAL FUNKTIONEN
// ===============================
function openQuestion(catIndex, qIndex) {
  stopTimer(); 
  currentQuestion = { catIndex, qIndex };

  // Wir schicken dem Server, dass wir die Frage öffnen
  // (Der Server markiert sie ggf. als "isOpen" und broadcastet new state)
  socket.emit("openQuestion", { catIndex, qIndex });

  // ABER wir wollen auch lokal das Modal öffnen, 
  // damit der user gleich was sieht:
  const questionObj = localCategories[catIndex].questions[qIndex];

  questionTextEl.textContent = questionObj.question || "Keine Frage?";
  
  if (questionObj.image) {
    questionImageEl.src = questionObj.image;
    questionImageEl.style.display = "block";
  } else {
    questionImageEl.style.display = "none";
  }

  // Antwort-Bereich ausblenden
  answerContainerEl.style.display = "none";
  answerTextEl.textContent = "";
  answerImageEl.style.display = "none";
  answerImageEl.src = "";

  // Spieler-Liste
  playerSelectEl.innerHTML = "";
  localPlayers.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = p.name;
    playerSelectEl.appendChild(option);
  });

  timerDisplayEl.textContent = "";
  questionSound = null;
  questionModalBackdrop.style.display = "flex";

  // Sound-Button
  if (questionObj.sound) {
    playQuestionSoundBtn.style.display = "inline-block";
  } else {
    playQuestionSoundBtn.style.display = "none";
  }
}

function onRevealAnswer() {
  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = localCategories[catIndex].questions[qIndex];

  answerContainerEl.style.display = "block";
  answerTextEl.textContent = questionObj.answer || "";

  if (questionObj.answerImage) {
    answerImageEl.src = questionObj.answerImage;
    answerImageEl.style.display = "block";
  }
}

function onCorrectAnswer() {
  playSound(correctSoundEl);

  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = localCategories[catIndex].questions[qIndex];
  const playerIndex = parseInt(playerSelectEl.value);

  // Anstatt lokal `players[playerIndex].score += ...`
  // -> socket.emit an den Server
  socket.emit("answerCorrect", {
    catIndex, 
    qIndex, 
    playerIndex
  });
  
  // Modal schließen (lokal)
  closeModal();
}

function onIncorrectAnswer() {
  playSound(buzzerSoundEl);

  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const playerIndex = parseInt(playerSelectEl.value);

  socket.emit("answerWrong", {
    catIndex,
    qIndex,
    playerIndex
  });
  // Frage bleibt offen, Modal bleibt auf
  renderScoreboard(); // wir refreshen ggf. unsere Punkte
}

function onCloseQuestionCompletely() {
  if (!currentQuestion) return;
  if (questionSound) {
    questionSound.pause();
    questionSound = null;
  }

  const { catIndex, qIndex } = currentQuestion;
  // Socket-Event "closeQuestionCompletely", 
  // der Server setzt "used = true"
  socket.emit("closeQuestionCompletely", { catIndex, qIndex });

  closeModal();
}

function closeModal() {
  stopTimer();
  if (questionSound) {
    questionSound.pause();
    questionSound = null;
  }

  questionModalBackdrop.style.display = "none";
  currentQuestion = null;
}


// ===============================
// 5) TIMER
// ===============================
function startTimer() {
  stopTimer();
  countdown = 10;
  timerDisplayEl.textContent = countdown;
  timerId = setInterval(() => {
    countdown--;
    timerDisplayEl.textContent = countdown;
    if (countdown <= 0) {
      stopTimer();
      timerDisplayEl.textContent = "Zeit abgelaufen!";
      playSound(buzzerSoundEl);
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}


// ===============================
// 6) SOUND-FUNKTIONEN
// ===============================
function playSound(audioElement) {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play();
  }
}

function onPlayQuestionSound() {
  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = localCategories[catIndex].questions[qIndex];

  if (!questionObj.sound) {
    alert("Kein Sound für diese Frage hinterlegt!");
    return;
  }

  if (questionSound) {
    questionSound.pause();
    questionSound = null;
  }

  questionSound = new Audio(questionObj.sound);
  questionSound.currentTime = 0;
  questionSound.play();
}


// ===============================
// 7) FINAL JEOPARDY 
// ===============================
function startFinalJeopardy() {
  isFinalJeopardyActive = true;
  finalJeopardySection.style.display = "block";
  finalQuestionTextEl.textContent = localFinalJeopardyQuestion;

  wagers = localPlayers.map(() => 0);
  wagerSectionEl.innerHTML = "";
  localPlayers.forEach((player, idx) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${player.name} (Punkte: ${player.score}): </span>
      <input type="number" id="wagerInput${idx}" min="0" max="${player.score}" value="0" />
    `;
    wagerSectionEl.appendChild(div);
  });
}

function revealFinalAnswer() {
  localPlayers.forEach((_, idx) => {
    const input = document.getElementById(`wagerInput${idx}`);
    if (input) {
      wagers[idx] = parseInt(input.value) || 0;
    }
  });

  finalAnswerSectionEl.style.display = "block";
  finalAnswerTextEl.textContent = localFinalJeopardyAnswer;

  finalCheckSectionEl.innerHTML = "";
  localPlayers.forEach((player, idx) => {
    const p = document.createElement("div");
    p.innerHTML = `
      <label style="display:inline-block; width: 200px; color:#fff;">
        Hat ${player.name} richtig geantwortet?
      </label>
      <button style="margin-right:10px;" onclick="handleFinalAnswer(${idx}, true)">Ja</button>
      <button onclick="handleFinalAnswer(${idx}, false)">Nein</button>
    `;
    finalCheckSectionEl.appendChild(p);
  });
}

function handleFinalAnswer(playerIndex, correct) {
  if (correct) {
    playSound(correctSoundEl);
    localPlayers[playerIndex].score += wagers[playerIndex];
  } else {
    playSound(buzzerSoundEl);
    localPlayers[playerIndex].score -= wagers[playerIndex];
  }
  renderScoreboard();
}

function endFinalJeopardy() {
  isFinalJeopardyActive = false;
  alert("Final Jeopardy ist beendet! Die Punkte sind nun final.");
  finalJeopardySection.style.display = "none";
}
