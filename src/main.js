const newGameBtn = document.getElementById('get-deck-btn');
const deckIdEl = document.getElementById('deck-id');
const remainingCardsEl = document.getElementById('remaining');
const drawCardBtn = document.getElementById('draw-cards-btn');
const cardContainer = document.querySelector('.card-container');
const roundModal = document.getElementById("round-modal");



let deckId = '';
let remaining = 0;
let drawnCards = [];
drawCardBtn.disabled = true;

//score values
let playerScore = 0;
let computerScore = 0;
let roundCount = 0;
let modalTimeout = null;

// fetch deck of cards from deckofcardsapi.com

async function getnewDeck() {
  const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');

  if (!response.ok) {
    throw new Error(`HTTP status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

//fetch two cards from a specific deck on the deckofcardsapi.com
async function drawCards(deckId, count = 2) {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);

  if (!response.ok) {
    throw new Error(`HTTP status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}



async function displayCards(drawnCards) {
  let cardElements = Array.from(cardContainer.children);

  // wait for both images to load before displaying modal
  const loadPromises = drawnCards.map(card => waitForImage(card.image));
  await Promise.all(loadPromises);

  // now apply them
  cardElements.forEach((cardEl, index) => {
    if (drawnCards[index]) {
      cardEl.style.backgroundImage = `url(${drawnCards[index].image})`;
    }
  });
}



function getCardValue(card) {
  const value = card.value;

  if (!isNaN(value)) {
    return parseInt(value); // 2–10
  }

  switch (value) {
    case "ACE": return 14;
    case "KING": return 13;
    case "QUEEN": return 12;
    case "JACK": return 11;
    default: return 0;
  }
}


function scoreRound(drawnCards) {
  const playerValue = getCardValue(drawnCards[0]);
  const computerValue = getCardValue(drawnCards[1]);

  if (playerValue > computerValue) {
    playerScore++;
  } else if (computerValue > playerValue) {
    computerScore++;
  }

  // update UI
  document.getElementById("player-score-container").textContent = playerScore;
  document.getElementById("computer-score-container").textContent = computerScore;
}

function waitForImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
  });
}


function showModal(message, duration = 3000) {
  clearTimeout(modalTimeout);

  roundModal.textContent = message;
  roundModal.classList.remove("hidden");

  // Auto-hide unless duration is 0 (for Game Over)
  if (duration > 0) {
    modalTimeout = setTimeout(() => {
      roundModal.classList.add("hidden");
    }, duration);
  }
}

function hideModal() {
  roundModal.classList.add("hidden");
}



newGameBtn.addEventListener('click', async () => {
  try {
    const data = await getnewDeck();
    remaining = data.remaining;
    deckId = data.deck_id;
    deckIdEl.textContent = deckId;
    remainingCardsEl.textContent = remaining;

    // Reset scores and round
    playerScore = 0;
    computerScore = 0;
    roundCount = 0;

    document.getElementById("player-score-container").textContent = 0;
    document.getElementById("computer-score-container").textContent = 0;

    drawCardBtn.disabled = false;
    drawCardBtn.style.backgroundColor = 'yellow';

    showModal("Game Started! Draw your first card!", 2000);

  } catch (error) {
    console.error('Error fetching new deck:', error);
  }
});


drawCardBtn.addEventListener('click', async () => {
  if (!deckId) {
    alert('Please start a new game first!');
    return;
  }

  try {
    const data = await drawCards(deckId);

    if (data.cards.length > 0) {
      remaining -= data.cards.length;
      remainingCardsEl.textContent = remaining;
      drawnCards = data.cards;
    }

    // wait for images to fully load
    await displayCards(drawnCards);


    // 2. Score round
    const playerValue = getCardValue(drawnCards[0]);
    const computerValue = getCardValue(drawnCards[1]);

    roundCount++;

    let winnerText = "";

    if (playerValue > computerValue) {
      playerScore++;
      winnerText = `Round ${roundCount}: Player Wins`;
    } else if (computerValue > playerValue) {
      computerScore++;
      winnerText = `Round ${roundCount}: Computer Wins`;
    } else {
      winnerText = `Round ${roundCount}: It's a Tie`;
    }

    // Update UI scores
    document.getElementById("player-score-container").textContent = playerScore;
    document.getElementById("computer-score-container").textContent = computerScore;

    // ⭐ FIXED: Show modal AFTER card + score updates visually
    await new Promise(resolve => setTimeout(resolve, 0)); // allow DOM to apply background-image

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        showModal(winnerText, 3000);
      });
    });


    // GAME OVER
    if (remaining <= 0) {
      let gameWinner =
        playerScore > computerScore ? "PLAYER" :
          computerScore > playerScore ? "COMPUTER" :
            "NO ONE — It's a tie";



      await new Promise(resolve => setTimeout(resolve, 0));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          showModal(
            `GAME OVER!\nWinner: ${gameWinner}\nFinal Score: ${playerScore} - ${computerScore}`,
            0
          );
        });
      });



      drawCardBtn.disabled = true;
      drawCardBtn.style.backgroundColor = "gray";
    }

  } catch (error) {
    console.error('Error drawing cards:', error);
  }
});




showModal("Click NEW GAME to begin", 0);

