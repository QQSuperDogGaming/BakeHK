const item = items[round];
document.getElementById('roundTitle').textContent = `Round ${round + 1}: ${item.name}`;
document.getElementById('itemName').textContent = `${item.emoji} ${item.name}`;
playerScore = 0;
aiScore = 0;
timeLeft = 10;

document.getElementById('playerScore').textContent = playerScore;
document.getElementById('aiScore').textContent = aiScore;
document.getElementById('time').textContent = timeLeft;

showScreen('game');

timer = setInterval(() => {
timeLeft--;
document.getElementById('time').textContent = timeLeft;

```
// AI random baking logic
aiScore += Math.floor(Math.random() * 2); // 0 or 1
document.getElementById('aiScore').textContent = aiScore;

if (timeLeft <= 0) {
  clearInterval(timer);
  endRound();
}

```

}, 1000);
}

function bake() {
if (timeLeft > 0) {
playerScore++;
document.getElementById('playerScore').textContent = playerScore;
}
}

function endRound() {
let resultText = "";

if (playerScore > aiScore) {
playerWins++;
resultText = "🔥 You win this round!";
} else if (aiScore > playerScore) {
aiWins++;
resultText = "😓 You lost this round!";
} else {
resultText = "🤝 It's a tie!";
}

document.getElementById('battleResult').textContent = resultText;
round++;
showScreen('result');
}

function showFinalResult() {
const finalText = playerWins > aiWins
? "🎉 You win the Baking Battle of Hong Kong!"
: playerWins === aiWins
? "🤝 It's a tie!"
: "😢 You lost the Baking Battle.";

document.getElementById('battleResult').textContent = finalText;
document.querySelector('#result button:nth-child(2)').style.display = "none"; // Hide "Next Round"
showScreen('result');
}

function goHome() {
round = 0;
playerWins = 0;
aiWins = 0;
document.querySelector('#result button:nth-child(2)').style.display = "inline"; // Show "Next Round"
showScreen('menu');
}
