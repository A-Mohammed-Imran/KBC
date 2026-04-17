// Backend base URL (Render deployment).
const API_URL = "https://kbc-vq3p.onrender.com";

const QUESTIONS_API = `${API_URL}/api/questions`;
const ANSWER_API = `${API_URL}/api/answer`;
const optionLabels = ["A", "B", "C", "D"];

// Get HTML elements.
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const statusBox = document.getElementById("statusBox");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const questionNumberElement = document.getElementById("questionNumber");
const totalQuestionsElement = document.getElementById("totalQuestions");
const scoreElement = document.getElementById("score");
const questionTextElement = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedbackElement = document.getElementById("feedback");
const finalScoreElement = document.getElementById("finalScore");

// Quiz state variables.
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = false;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);

async function startQuiz() {
  resetQuizState();
  showScreen("quiz");
  showStatus("Waking up server... please wait", "info");

  try {
    const res = await fetch(QUESTIONS_API);
    console.log("GET /api/questions status:", res.status);

    if (!res.ok) {
      throw new Error("Failed to fetch questions. Status: " + res.status);
    }

    const data = await res.json();
    console.log("GET /api/questions data:", data);

    questions = data;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions available from backend.");
    }

    totalQuestionsElement.textContent = questions.length;
    hideStatus();
    loadQuestion();
  } catch (err) {
    console.error("Error:", err);
    showScreen("start");
    showStatus("Could not load questions from backend.", "error");
    alert("Backend not reachable");
  }
}

function resetQuizState() {
  questions = [];
  currentQuestionIndex = 0;
  score = 0;
  answered = false;

  scoreElement.textContent = "0";
  totalQuestionsElement.textContent = "0";
  nextBtn.disabled = true;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
}

function showScreen(screenName) {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  if (screenName === "start") {
    startScreen.classList.remove("hidden");
  }

  if (screenName === "quiz") {
    quizScreen.classList.remove("hidden");
  }

  if (screenName === "result") {
    resultScreen.classList.remove("hidden");
  }
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = "status " + type;
  statusBox.classList.remove("hidden");
}

function hideStatus() {
  statusBox.textContent = "";
  statusBox.className = "status hidden";
}

function loadQuestion() {
  answered = false;
  nextBtn.disabled = true;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  optionsContainer.innerHTML = "";

  const currentQuestion = questions[currentQuestionIndex];
  questionNumberElement.textContent = currentQuestionIndex + 1;
  questionTextElement.textContent = currentQuestion.question;

  // Create option buttons.
  for (let i = 0; i < currentQuestion.options.length; i++) {
    const optionText = currentQuestion.options[i];
    const optionButton = document.createElement("button");

    optionButton.className = "option-btn";
    optionButton.textContent = optionLabels[i] + ". " + optionText;

    optionButton.addEventListener("click", function () {
      checkAnswer(optionText, i, optionButton);
    });

    optionsContainer.appendChild(optionButton);
  }
}

async function checkAnswer(selectedAnswer, selectedIndex, selectedButton) {
  if (answered) {
    return;
  }

  answered = true;
  selectedButton.classList.add("selected");
  disableAllOptions();

  feedbackElement.textContent = "Checking answer...";
  feedbackElement.className = "feedback";

  const currentQuestion = questions[currentQuestionIndex];

  try {
    const res = await fetch(ANSWER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        selected_index: selectedIndex
      })
    });

    console.log("POST /api/answer status:", res.status);

    if (!res.ok) {
      throw new Error("Failed to submit answer. Status: " + res.status);
    }

    const result = await res.json();
    console.log("POST /api/answer data:", result);
    showAnswerResult(result, selectedButton);
  } catch (err) {
    console.error("Error:", err);
    feedbackElement.textContent = "Error: " + err.message;
    feedbackElement.className = "feedback incorrect-text";
    alert("Backend not reachable");
  }

  nextBtn.disabled = false;
}

function disableAllOptions() {
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  for (let i = 0; i < allButtons.length; i++) {
    allButtons[i].disabled = true;
  }
}

function showAnswerResult(result, selectedButton) {
  const currentQuestion = questions[currentQuestionIndex];
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  if (result.correct === true) {
    score = score + 1;
    scoreElement.textContent = score;
    selectedButton.classList.add("correct");
    feedbackElement.textContent = "Correct answer!";
    feedbackElement.className = "feedback correct-text";
    return;
  }

  selectedButton.classList.add("incorrect");

  // Highlight the correct answer button using returned answer text.
  const correctText = result.correct_answer;

  if (typeof correctText === "string") {
    const correctIndex = currentQuestion.options.indexOf(correctText);

    if (correctIndex !== -1 && allButtons[correctIndex]) {
      allButtons[correctIndex].classList.add("correct");
    }

    feedbackElement.textContent = "Wrong answer! Correct answer: " + correctText;
  } else {
    feedbackElement.textContent = "Wrong answer!";
  }

  feedbackElement.className = "feedback incorrect-text";
}

function nextQuestion() {
  if (!answered) {
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex = currentQuestionIndex + 1;
    loadQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  showScreen("result");
  finalScoreElement.textContent = score + " / " + questions.length;
}
