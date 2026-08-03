// (Simeon Dev-1) GLOBAL PLAYERS CONSTRUCTOR
function Player(name, mark) {
	return {
		name,
		mark,
		score: 0,
		win: function() {
			this.score++;
		}
	}
}

// (Simeon Dev-1) Initialize global players
let player1 = Player(null, null);
let player2 = Player(null, null);

// (Simeon Dev-1) Main Game Module
const Game = (function() {

	// (Simeon Dev-1) ELEMENTS
	const rootHeader = document.querySelector("#root-header");
	const allDivs = document.querySelectorAll("#root > div");

	const home = document.querySelector("#home");
	const startBtn = document.querySelector("#start-btn");

	const startGameDiv = document.querySelector("#start-game");
	const playerDetailsForm = document.querySelector("#player-details");
	const player1Select = document.querySelector("#player1-mark");
	const player2Select = document.querySelector("#player2-mark");
	const playBtn = document.querySelector("#play-btn");

	const gamePlayDiv = document.querySelector("#game-play-div");
	const gameInfoDisplay = document.querySelector("#game-info-display");
	const resetGameBtn = document.querySelector(".reset");

	// (Simeon Dev-1) Turn tracking
	let lastSelected = null;

	// (Simeon Dev-1) FUNCTIONS
	// (Simeon Dev-1) MAIN APP FUNCTION...
	function launchApp() {
		deployGameBoard();
		for (let div of allDivs) {
			div.classList.add("hide");
		}
		allDivs[0].classList.remove("hide");
		launchEventListeners();
	}

	// (Simeon Dev-1) FOUNDATIONAL FUNCTIONS...
	function deployGameBoard() {
		const gameCard = document.createElement("div");
		gameCard.setAttribute("id", "game-card");
		for (let i = 0; i < 9; i++) {
			const markCard = document.createElement("div");
			markCard.classList.add("mark-card");
			gameCard.appendChild(markCard);
		}
		gamePlayDiv.insertBefore(gameCard, gameInfoDisplay.nextSibling);
	}

	// (Simeon Dev-1) Synchronize marker selection between players
	function syncMarkers(event) {
	  const changedSelect = event.target;
	  const otherSelect = changedSelect.id === 'player1-mark' 
	    ? player2Select 
	    : player1Select;
	  
	  otherSelect.value = changedSelect.value === 'X' ? 'O' : 'X';
	}

	// (Simeon Dev-1) Process player data from form submission
	function processPlayerDataForm(form) {
		const formData = new FormData(form);

		const p1Name = formData.get("player1Name"),
			  p1Mark = formData.get("player1Mark"),
			  p2Name = formData.get("player2Name"),
			  p2Mark = formData.get("player2Mark");

		return {p1Name, p1Mark, p2Name, p2Mark};
	}

	// (Simeon Dev-1) Update global player objects with form data
	function createPlayers(p1Name, p1Mark, p2Name, p2Mark) {
		player1.name = p1Name;
		player2.name = p2Name;
		player1.mark = p1Mark;
		player2.mark = p2Mark;
	}

	// (Simeon Dev-1) GAME PLAY FUNCTION - uses global players
	function launchGame() {
		startGameDiv.classList.add("hide");
		rootHeader.classList.add("hide");
		gamePlayDiv.classList.remove("hide");
		
		updateGameDiv();
		activateResetBtn();
		activateCards();
	}

	// (Simeon Dev-1) GAME PLAY FUNCTION DEPENDENCIES
	// (Simeon Dev-1) Activate click handlers for game board cards
	function activateCards() {
		// Start with player 2's mark (so first click is player 1)
		lastSelected = player2.mark;
		const markCards = document.querySelectorAll(".mark-card");
		for (let card of markCards) {
			card.addEventListener("click", (e) => {
				// Prevent overwriting existing marks
				if (e.target.textContent !== '') return;

				// Determine which mark to place
				let markToPlace;
				if (lastSelected === "X") markToPlace = "O";
				else if (lastSelected === "O") markToPlace = "X";
				else markToPlace = "ERROR"; // fallback

				e.target.innerText = markToPlace;

				// Update lastSelected for next turn
				lastSelected = markToPlace;

				const result = checkMarkMatch();

				let winner;
			
				if (result === "X" || result === "O") {
					winner = checkWinner(result);
					processWin(winner);
				}
				else if (checkTie()) {
					document.querySelector("#leading-player-display > p").textContent = "TIE 🤝"
					setTimeout(() => {
						clearGameBoard();
						updateGameDiv();
					}, 1500); // increased delay to show tie
				}
				else if (result === null) {
					// No win or tie yet, continue
				}
				else {
					// Should never happen
				}
			});
		}
	}

	// (Simeon Dev-1) Activate reset button functionality
	function activateResetBtn() {
		resetGameBtn.addEventListener("click", () => {
			resetScores();
		});
	}

	// (Simeon Dev-1) Determine winner based on winning mark
	function checkWinner(winMark) {
		if (player1.mark === winMark) {return player1;}
		else if (player2.mark === winMark) {return player2;}
		else {return "weirdError";}
	}

	// (Simeon Dev-1) Process win - update score and display
	function processWin(winner) {
		if (winner === null) {
			return;
		}
		else if (winner === player1) {
			player1.win();
			updateGameDiv();
			setTimeout(clearGameBoard, 1500); // increased delay
		}
		else if (winner === player2) {
			player2.win();
			updateGameDiv();
			setTimeout(clearGameBoard, 1500);
		}
	}
	
	// (Simeon Dev-1) Update game display with current scores
	function updateGameDiv() {
		const leadingPlayerPara = document.querySelector("#leading-player-display > p");
		const player1ScorePara = document.querySelector("#player-1 > p");
		const player2ScorePara = document.querySelector("#player-2 > p");

		const leadingPlayer = player1.score > player2.score ? player1.name.toUpperCase() :
							 player2.score > player1.score ? player2.name.toUpperCase() :
							 player1.score === player2.score ? "PLAY..." :
							 "ERROR-leadingPlayer";
		
		player1ScorePara.textContent = `${player1.name} (${player1.mark}): ${player1.score}`;
		player2ScorePara.textContent = `${player2.name} (${player2.mark}): ${player2.score}`;
		leadingPlayerPara.textContent = `🏆 ${leadingPlayer}`;
	}

	// (Simeon Dev-1) Clear all marks from game board
	function clearGameBoard() {
		const markCards = document.querySelectorAll('.mark-card');
		for (let card of markCards) {
			card.textContent = "";
		}
	}

	// (Simeon Dev-1) Reset scores for both players
	function resetScores() {
		player1.score = 0;
		player2.score = 0;
		clearGameBoard();
		// Reset turn order to player 2's mark (so first click is player 1)
		lastSelected = player2.mark;
		updateGameDiv();
	}

	// (Simeon Dev-1) Check if any winning pattern is matched
	function checkMarkMatch() {
	  const squares = document.querySelectorAll('.mark-card');
	  
	  // (Simeon Dev-1) All winning combinations (indices)
	  const winPatterns = [
	    [0, 1, 2], [3, 4, 5], [6, 7, 8],
	    [0, 3, 6], [1, 4, 7], [2, 5, 8],
	    [0, 4, 8], [2, 4, 6]
	  ];
	  
	  for (let pattern of winPatterns) {
	    const [a, b, c] = pattern;
	    const valA = squares[a].textContent;
	    const valB = squares[b].textContent;
	    const valC = squares[c].textContent;
	    
	    if (valA !== '' && valA !== null && valA === valB && valB === valC) {
	      return valA;
	    }
	  }
	  
	  return null;
	}

	// (Simeon Dev-1) Check if game is a tie (board full with no winner)
	function checkTie() {
	  const squares = document.querySelectorAll('.mark-card');
	  
	  // Check if every square has content (not empty)
	  for (let square of squares) {
	    if (square.textContent === '') {
	      return false; // Found empty square, game not over
	    }
	  }
	  
	  return true; // All squares filled, it's a tie!
	}
	
	// (Simeon Dev-1) GLOBAL EVENT LISTENERS...
	function launchEventListeners() {
		// (Simeon Dev-1) Start button - show player setup
		startBtn.addEventListener("click", () => {
			home.classList.add("hide");
			startGameDiv.classList.remove("hide");
		});

		// (Simeon Dev-1) Marker selection synchronization
		player1Select.addEventListener('change', syncMarkers);
		player2Select.addEventListener('change', syncMarkers);

		// (Simeon Dev-1) Player form submission
		playerDetailsForm.addEventListener("submit", (e) => {
			e.preventDefault();

			const {p1Name, p1Mark, p2Name, p2Mark} = processPlayerDataForm(e.target);

			createPlayers(p1Name, p1Mark, p2Name, p2Mark);

			e.target.reset();

			launchGame();
		});
	}

	// (Simeon Dev-1) Return public API
	return {launchApp};

})();

// (Simeon Dev-1) Start the game
Game.launchApp();
