// script.js

// Globale Variablen aus questions.js:
//   categories, players, maxPlayers, finalJeopardyQuestion, finalJeopardyAnswer

let currentQuestion = null;
let isFinalJeopardyActive = false;
let wagers = [];
let timerId = null;
let countdown = 0;

// NEU: Audio-Objekt für Frage-Sounds
let questionSound = null;

// DOM
const scoreboardEl = document.getElementById("scoreboard");
const categoryBoardEl = document.getElementById("categoryBoard");
const questionModalBackdrop = document.getElementById("questionModalBackdrop");
const questionTextEl = document.getElementById("questionText");
const questionImageEl = document.getElementById("questionImage");
const startTimerBtn = document.getElementById("startTimerBtn");
const timerDisplayEl = document.getElementById("timerDisplay");
const revealAnswerBtn = document.getElementById("revealAnswerBtn");
const answerContainerEl = document.getElementById("answerContainer");
const answerTextEl = document.getElementById("answerText");
const answerImageEl = document.getElementById("answerImage");
const correctBtn = document.getElementById("correctBtn");
const incorrectBtn = document.getElementById("incorrectBtn");
const closeQuestionBtn = document.getElementById("closeQuestionBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const playerSelectEl = document.getElementById("playerSelect");
const finalJeopardyBtn = document.getElementById("finalJeopardyBtn");
const finalJeopardySection = document.getElementById("finalJeopardySection");
const finalQuestionTextEl = document.getElementById("finalQuestionText");
const wagerSectionEl = document.getElementById("wagerSection");
const revealFinalAnswerBtn = document.getElementById("revealFinalAnswerBtn");
const finalAnswerSectionEl = document.getElementById("finalAnswerSection");
const finalAnswerTextEl = document.getElementById("finalAnswerText");
const finalCheckSectionEl = document.getElementById("finalCheckSection");
const endFinalJeopardyBtn = document.getElementById("endFinalJeopardyBtn");
const playQuestionSoundBtn = document.getElementById("playQuestionSoundBtn");

// Sound-Elemente aus HTML (z. B. Buzzer + Correct)
const buzzerSoundEl = document.getElementById("buzzerSound");
const correctSoundEl = document.getElementById("correctSound");

initGame();

function initGame() {
  // Beispiel: Anzahl Spieler abfragen
  const anzahl = prompt("Wie viele Spieler? (1-4)", "4");
  let num = parseInt(anzahl);
  if (isNaN(num) || num < 1 || num > maxPlayers) {
    num = maxPlayers; 
  }
  
  // Trimme "players" Array auf "num" Spieler
  players.splice(num);
  // Namen abfragen
  for (let i = 0; i < players.length; i++) {
    const name = prompt(`Name für Spieler ${i+1}?`, players[i].name);
    if (name) players[i].name = name;
  }

  renderScoreboard();
  renderCategoryBoard();

  finalJeopardyBtn.addEventListener("click", startFinalJeopardy);
  startTimerBtn.addEventListener("click", startTimer);
  revealAnswerBtn.addEventListener("click", onRevealAnswer);
  correctBtn.addEventListener("click", onCorrectAnswer);
  incorrectBtn.addEventListener("click", onIncorrectAnswer);
  closeQuestionBtn.addEventListener("click", onCloseQuestionCompletely);
  closeModalBtn.addEventListener("click", closeModal);
  revealFinalAnswerBtn.addEventListener("click", revealFinalAnswer);
  endFinalJeopardyBtn.addEventListener("click", endFinalJeopardy);
  playQuestionSoundBtn.addEventListener("click", onPlayQuestionSound);
}

// ========== Scoreboard ==========
function renderScoreboard() {
  scoreboardEl.innerHTML = "";
  players.forEach((player, idx) => {
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

// ========== Kategorien-Board ==========
function renderCategoryBoard() {
  categoryBoardEl.innerHTML = "";
  categories.forEach((cat, catIndex) => {
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
        cellDiv.classList.add("used");
        cellDiv.style.pointerEvents = "none";
      } else {
        cellDiv.addEventListener("click", () => openQuestion(catIndex, qIndex));
      }
      columnDiv.appendChild(cellDiv);
    });

    categoryBoardEl.appendChild(columnDiv);
  });
}

// ========== Frage öffnen ==========
function openQuestion(catIndex, qIndex) {
  stopTimer(); // Timer stoppen, falls noch aktiv

  currentQuestion = { catIndex, qIndex };
  const questionObj = categories[catIndex].questions[qIndex];

  questionTextEl.textContent = questionObj.question;

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
  players.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = p.name;
    playerSelectEl.appendChild(option);
  });

  // Timer-Anzeige leeren
  timerDisplayEl.textContent = "";

  // NEU: Frage-Sound abspielen, falls definiert
  //if (questionObj.sound) {
  //  questionSound = new Audio(questionObj.sound);
  //  questionSound.play();
  //} else {
  //  questionSound = null;
  //}

  questionSound = null;

  questionModalBackdrop.style.display = "flex";

  if (questionObj.sound) {
    playQuestionSoundBtn.style.display = "inline-block";
  } else {
    playQuestionSoundBtn.style.display = "none";
  }
}

// ========== Antwort anzeigen ==========
function onRevealAnswer() {
  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = categories[catIndex].questions[qIndex];

  answerContainerEl.style.display = "block";
  answerTextEl.textContent = questionObj.answer;

  if (questionObj.answerImage) {
    answerImageEl.src = questionObj.answerImage;
    answerImageEl.style.display = "block";
  }
}

// ========== Richtig beantwortet ==========
function onCorrectAnswer() {
  playSound(correctSoundEl); // Sound für korrekte Antwort
  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = categories[catIndex].questions[qIndex];
  const playerIndex = parseInt(playerSelectEl.value);

  players[playerIndex].score += questionObj.value;
  questionObj.used = true;

  closeModal();
  renderScoreboard();
  renderCategoryBoard();
}

// ========== Falsch beantwortet ==========
function onIncorrectAnswer() {
  playSound(buzzerSoundEl); // Buzzer-Sound
  if (!currentQuestion) return;
  const { catIndex, qIndex } = currentQuestion;
  const questionObj = categories[catIndex].questions[qIndex];
  const playerIndex = parseInt(playerSelectEl.value);

  players[playerIndex].score -= questionObj.value;
  // Frage bleibt "unused"
  renderScoreboard();
}

// ========== Frage beenden (manuell) ==========
function onCloseQuestionCompletely() {
  if (!currentQuestion) return;

  // NEU: Frage-Sound stoppen, falls noch läuft
  if (questionSound) {
    questionSound.pause();
    questionSound = null;
  }

  const { catIndex, qIndex } = currentQuestion;
  categories[catIndex].questions[qIndex].used = true;

  closeModal();
  renderCategoryBoard();
}

// ========== Modal schließen (Abbrechen) ==========
function closeModal() {
  stopTimer();
  // NEU: Frage-Sound stoppen
  if (questionSound) {
    questionSound.pause();
    questionSound = null;
  }

  questionModalBackdrop.style.display = "none";
  currentQuestion = null;
}

// ========== Timer starten ==========
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

// ========== Sound abspielen-Hilfsfunktion ==========
function playSound(audioElement) {
  if (audioElement) {
    audioElement.currentTime = 0; 
    audioElement.play();
  }
}

function onPlayQuestionSound() {
    if (!currentQuestion) return; // Keine Frage offen?
  
    const { catIndex, qIndex } = currentQuestion;
    const questionObj = categories[catIndex].questions[qIndex];
  
    // Prüfen, ob sound definiert ist
    if (!questionObj.sound) {
      alert("Kein Sound für diese Frage hinterlegt!");
      return;
    }
  
    // Falls wir schon ein Audio haben, erst stoppen
    if (questionSound) {
      questionSound.pause();
      questionSound = null;
    }
  
    // Neues Audio-Objekt anlegen und abspielen
    questionSound = new Audio(questionObj.sound);
    questionSound.currentTime = 0;
    questionSound.play();
}





// ========== Final Jeopardy ==========
function startFinalJeopardy() {
  isFinalJeopardyActive = true;
  finalJeopardySection.style.display = "block";
  finalQuestionTextEl.textContent = finalJeopardyQuestion;

  wagers = players.map(() => 0);
  wagerSectionEl.innerHTML = "";
  players.forEach((player, idx) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${player.name} (Punkte: ${player.score}): </span>
      <input type="number" id="wagerInput${idx}" min="0" max="${player.score}" value="0" />
    `;
    wagerSectionEl.appendChild(div);
  });
}

function revealFinalAnswer() {
  players.forEach((_, idx) => {
    const input = document.getElementById(`wagerInput${idx}`);
    if (input) {
      wagers[idx] = parseInt(input.value) || 0;
    }
  });

  finalAnswerSectionEl.style.display = "block";
  finalAnswerTextEl.textContent = finalJeopardyAnswer;

  finalCheckSectionEl.innerHTML = "";
  players.forEach((player, idx) => {
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
    players[playerIndex].score += wagers[playerIndex];
  } else {
    playSound(buzzerSoundEl);
    players[playerIndex].score -= wagers[playerIndex];
  }
  renderScoreboard();
}

function endFinalJeopardy() {
  isFinalJeopardyActive = false;
  alert("Final Jeopardy ist beendet! Die Punkte sind nun final.");
  finalJeopardySection.style.display = "none";
}

