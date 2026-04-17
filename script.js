// Quiz data stored in an array of objects.
const quizQuestions = [
  {
    question: "What is the capital city of India?",
    options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    correct: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correct: 1
  },
  {
    question: "What is 8 x 7?",
    options: ["54", "48", "56", "64"],
    correct: 2
  },
  {
    question: "Which language is used to style web pages?",
    options: ["HTML", "Python", "CSS", "C++"],
    correct: 2
  },
  {
    question: "Who wrote the Indian National Anthem?",
    options: ["Bankim Chandra Chattopadhyay", "Rabindranath Tagore", "Mahatma Gandhi", "Sarojini Naidu"],
    correct: 1
  },
  {
    question: "How many continents are there in the world?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "Which of these is a JavaScript data type?",
    options: ["Boolean", "Character", "Decimal", "Fraction"],
    correct: 0
  },
  {
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<a>", "<h1>", "<p>"],
    correct: 1
  }
];

const optionLabels = ["A", "B", "C", "D"];

// Get all required HTML elements.
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const lifelineBtn = document.getElementById("lifelineBtn");

const questionNumberElement = document.getElementById("questionNumber");
const totalQuestionsElement = document.getElementById("totalQuestions");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const questionTextElement = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const messageElement = document.getElementById("message");
const finalScoreElement = document.getElementById("finalScore");

// Quiz state variables.
let currentQuestion = 0;
let score = 0;
let answered = false;
let timerValue = 30;
let timerInterval;
let lifelineUsed = false;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);
lifelineBtn.addEventListener("click", useFiftyFifty);

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  lifelineUsed = false;
  updateScore();

  totalQuestionsElement.textContent = quizQuestions.length;
  lifelineBtn.disabled = false;

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  loadQuestion();
}

function loadQuestion() {
  answered = false;
  nextBtn.disabled = true;
  messageElement.textContent = "";
  messageElement.className = "message";
  optionsContainer.innerHTML = "";

  const currentData = quizQuestions[currentQuestion];
  questionNumberElement.textContent = currentQuestion + 1;
  questionTextElement.textContent = currentData.question;

  // Create one button for each option.
  for (let i = 0; i < currentData.options.length; i++) {
    const optionButton = document.createElement("button");
    optionButton.className = "option-btn";
    optionButton.textContent = optionLabels[i] + ". " + currentData.options[i];

    optionButton.addEventListener("click", function () {
      checkAnswer(i, optionButton);
    });

    optionsContainer.appendChild(optionButton);
  }

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerValue = 30;
  timerElement.textContent = timerValue;

  timerInterval = setInterval(function () {
    timerValue--;
    timerElement.textContent = timerValue;

    if (timerValue <= 0) {
      clearInterval(timerInterval);

      if (!answered) {
        answered = true;
        lockOptions();
        showCorrectAnswer();

        const currentData = quizQuestions[currentQuestion];
        messageElement.textContent =
          "Time is up! Correct answer: " +
          optionLabels[currentData.correct] +
          ". " +
          currentData.options[currentData.correct];
        messageElement.classList.add("incorrect-text");

        nextBtn.disabled = false;
      }
    }
  }, 1000);
}

function checkAnswer(selectedIndex, selectedButton) {
  if (answered) {
    return;
  }

  answered = true;
  clearInterval(timerInterval);
  selectedButton.classList.add("selected");

  const currentData = quizQuestions[currentQuestion];

  if (selectedIndex === currentData.correct) {
    score++;
    updateScore();

    selectedButton.classList.add("correct");
    messageElement.textContent = "Correct answer!";
    messageElement.classList.add("correct-text");
  } else {
    selectedButton.classList.add("incorrect");
    showCorrectAnswer();

    messageElement.textContent =
      "Wrong answer! Correct answer: " +
      optionLabels[currentData.correct] +
      ". " +
      currentData.options[currentData.correct];
    messageElement.classList.add("incorrect-text");
  }

  lockOptions();
  nextBtn.disabled = false;
}

function lockOptions() {
  const allOptions = optionsContainer.querySelectorAll(".option-btn");

  for (let i = 0; i < allOptions.length; i++) {
    allOptions[i].disabled = true;
  }
}

function showCorrectAnswer() {
  const currentData = quizQuestions[currentQuestion];
  const allOptions = optionsContainer.querySelectorAll(".option-btn");
  allOptions[currentData.correct].classList.add("correct");
}

function nextQuestion() {
  if (!answered) {
    return;
  }

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  clearInterval(timerInterval);
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  finalScoreElement.textContent = score + " / " + quizQuestions.length;
}

function updateScore() {
  scoreElement.textContent = score;
}

function useFiftyFifty() {
  if (lifelineUsed || answered) {
    return;
  }

  const currentData = quizQuestions[currentQuestion];
  const allOptions = optionsContainer.querySelectorAll(".option-btn");
  const wrongIndexes = [];

  // Collect only wrong option indexes.
  for (let i = 0; i < allOptions.length; i++) {
    if (i !== currentData.correct) {
      wrongIndexes.push(i);
    }
  }

  // Shuffle wrong options and hide two of them.
  wrongIndexes.sort(function () {
    return Math.random() - 0.5;
  });

  for (let i = 0; i < 2; i++) {
    const indexToHide = wrongIndexes[i];
    allOptions[indexToHide].disabled = true;
    allOptions[indexToHide].style.visibility = "hidden";
  }

  lifelineUsed = true;
  lifelineBtn.disabled = true;
  messageElement.textContent = "50-50 lifeline used.";
  messageElement.className = "message";
}
