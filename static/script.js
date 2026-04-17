// Use local Flask API on localhost, otherwise use deployed backend.
const API_URL = window.location.hostname === "localhost"
  ? ""
  : "https://kbc-vq3p.onrender.com";

const QUESTIONS_API = API_URL + "/api/questions";
const ANSWER_API = API_URL + "/api/answer";
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
  showStatus("Loading questions...", "info");

  try {
    const response = await fetch(QUESTIONS_API);

    if (!response.ok) {
      throw new Error("Failed to fetch questions. Status: " + response.status);
    }

    questions = await response.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions available from backend.");
    }

    totalQuestionsElement.textContent = questions.length;
    hideStatus();
    loadQuestion();
  } catch (error) {
    showScreen("start");
    showStatus(error.message, "error");
    console.error("Start quiz error:", error.message);
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
    const response = await fetch(ANSWER_API, {
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

    if (!response.ok) {
      throw new Error("Failed to submit answer. Status: " + response.status);
    }

    const result = await response.json();
    showAnswerResult(result, selectedButton, selectedIndex);
  } catch (error) {
    feedbackElement.textContent = "Error: " + error.message;
    feedbackElement.className = "feedback incorrect-text";
    console.error("Answer submit error:", error.message);
  }

  nextBtn.disabled = false;
}

function disableAllOptions() {
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  for (let i = 0; i < allButtons.length; i++) {
    allButtons[i].disabled = true;
  }
}

function showAnswerResult(result, selectedButton, selectedIndex) {
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
