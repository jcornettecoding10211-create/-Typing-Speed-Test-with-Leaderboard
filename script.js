const quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "Code is like humor. When you have to explain it, it’s bad.",
  "Simplicity is the soul of efficiency.",
  "Typing fast is not enough; accuracy matters too.",
  "Practice makes perfect in everything, including coding."
];

const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leaderboardList = document.getElementById("leaderboardList");

let currentQuote = "";
let timer = 0;
let interval = null;
let started = false;

// Load leaderboard from localStorage
let leaderboard = JSON.parse(localStorage.getItem("typingLeaderboard")) || [];
renderLeaderboard();

function startTest() {
  // Pick random quote
  currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.innerHTML = currentQuote.split("").map(char => `<span>${char}</span>`).join("");

  // Reset
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  timer = 0;
  timerEl.textContent = "0";
  wpmEl.textContent = "0";
  accuracyEl.textContent = "0%";
  started = true;

  // Hide/show buttons
  startBtn.style.display = "none";
  restartBtn.style.display = "none";

  // Start timer
  interval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);
}

function endTest() {
  clearInterval(interval);
  inputEl.disabled = true;
  started = false;
  restartBtn.style.display = "inline-block";

  // Calculate stats
  const typedText = inputEl.value.trim();
  const wordsTyped = typedText.split(/\s+/).filter(word => word).length;
  const wpm = Math.round((wordsTyped / timer) * 60);

  // Accuracy
  let correctChars = 0;
  const spans = quoteEl.querySelectorAll("span");
  spans.forEach((span, i) => {
    if (typedText[i] === span.textContent) {
      correctChars++;
    }
  });
  const accuracy = Math.round((correctChars / currentQuote.length) * 100);

  wpmEl.textContent = isNaN(wpm) ? "0" : wpm;
  accuracyEl.textContent = isNaN(accuracy) ? "0%" : accuracy + "%";

  // Save score in leaderboard
  leaderboard.push({ wpm, accuracy, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.wpm - a.wpm); // sort by highest WPM
  leaderboard = leaderboard.slice(0, 5); // keep only top 5

  localStorage.setItem("typingLeaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  leaderboardList.innerHTML = leaderboard
    .map((score, i) => 
      `<li><strong>${score.wpm} WPM</strong> (${score.accuracy}% accuracy) - ${score.date}</li>`
    ).join("");
}

startBtn.addEventListener("click", startTest);

restartBtn.addEventListener("click", () => {
  startBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
  quoteEl.textContent = "";
  inputEl.value = "";
  timerEl.textContent = "0";
  wpmEl.textContent = "0";
  accuracyEl.textContent = "0%";
});

inputEl.addEventListener("input", () => {
  if (!started) return;

  const spans = quoteEl.querySelectorAll("span");
  const typedText = inputEl.value.split("");

  spans.forEach((span, i) => {
    if (typedText[i] == null) {
      span.classList.remove("correct", "incorrect");
    } else if (typedText[i] === span.textContent) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
    }
  });

  if (typedText.join("") === currentQuote) {
    endTest();
  }
});
