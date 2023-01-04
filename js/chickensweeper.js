const timerEl = document.querySelector("div.timer");
const chickenCountEl = document.querySelector("div.chicken-counter");
const gameOverEl = document.querySelector("div.game-over");

const startScreenEl = document.querySelector("div.start-screen");
const settingScreenEl = document.querySelector("div.settings-screen");
const leaderboardEl = document.querySelector("div#leaderboard");
const gameEl = document.querySelector("div.game");
const returnButtonEl = document.querySelector("button#return-button");
const restartButtonEl = document.querySelector("button#restart-button");
const timesEl = document.querySelector("div#times");

const field = document.querySelector("div.field");
var gameStarted = false,
	startTime,
	passedTime,
	gameField = [],
	initialCounter = 0,
	clearedCounter = 0,
	chickenCounter = 0,
	gameOverStatus = false,
	timerInterval,
	stack = [],

	height,
	width,
	odds;

document.querySelector("button#settings-button").onclick = function(event) {
	startScreenEl.classList.toggle("hidden");
	settingScreenEl.classList.toggle("hidden");
	returnButtonEl.classList.toggle("hidden");
}

returnButtonEl.onclick = function(event) {
	startScreenEl.classList.toggle("hidden", false);
	settingScreenEl.classList.toggle("hidden", true);
	returnButtonEl.classList.toggle("hidden", true);
	gameEl.classList.toggle("hidden", true);
	leaderboardEl.classList.toggle("hidden", true);
	gameOverEl.classList.toggle("hidden", true);
	restartButtonEl.classList.toggle("hidden", true);
	resetField();
}

document.querySelector("button#leaderboard-button").onclick = function(event) {
	startScreenEl.classList.toggle("hidden");
	leaderboardEl.classList.toggle("hidden");
	timesEl.classList.toggle("hidden", false);
	generateLeaderboard();
}

document.querySelector("button#back-button").onclick = function(event) {
	startScreenEl.classList.toggle("hidden", false);
	leaderboardEl.classList.toggle("hidden", true);
	timesEl.classList.toggle("hidden", true);
}

restartButtonEl.onclick = function(event) {
	gameOverEl.classList.toggle("hidden", true);
	resetField();
	createField(width, height);
}

function resetField() {
	field.innerHTML = "";
	gameStarted = false;
	startTime = 0;
	passedTime = 0;
	gameField = [];
	initialCounter = 0;
	clearedCounter = 0,
	chickenCounter = 0,
	gameOverStatus = false;
	clearInterval(timerInterval);
	stack = [];
	chickenCountEl.firstElementChild.innerHTML = "";
	timerEl.firstElementChild.innerHTML = "";
}

function createField(width, height) {
	// create field for both in here (js) and the html
	for (let i = 0; i < width; i++) {
		let tempRow = document.createElement("div");
		tempRow.classList.add("row");

		gameField.push([]);
		
		for (let j = 0; j < height; j++) {
			// fill gameField with 0's for later index use
			gameField[i].push(0);

			let tempColumn = document.createElement("div");
			tempColumn.classList.add("column");
			Object.assign(tempColumn.dataset, {x: i, y: j});
			tempColumn.onclick = function(evt){chickenCheck(evt)};
			tempColumn.addEventListener('contextmenu', function(evt){ flag(evt); });
			tempRow.appendChild(tempColumn);
		}
		field.appendChild(tempRow);
	}
}

document.querySelector("button#start-button").onclick = function(event) {


	// retrieve input from input fields
	width = parseInt(document.querySelector("input#width").value);
	height = parseInt(document.querySelector("input#height").value);
	odds = parseFloat(document.querySelector("input#odds").value);

	if (width == 0 || height == 0 || odds == 0 || !width || !height || !odds)
	{
		alert("No input can be 0 or left empty");
	} else if (Math.round((width * height) / 100 * odds) < 1) {
		alert("Odds cannot be small enough for the chicken count to reach 0")
	} else if (Math.round((width * height) / 100 * odds) >= width * height)
	{
		alert("Odds cannot be big enough for the chicken count to more or equal to the tiles available")
	} else
	{
		createField(width, height);
		settingScreenEl.classList.toggle("hidden");
		gameEl.classList.toggle("hidden");
		restartButtonEl.classList.toggle("hidden", false);
	}
}

function flag(evt) {
	evt.preventDefault();

	let clickedX = parseInt(evt.currentTarget.dataset.x);
	let clickedY = parseInt(evt.currentTarget.dataset.y);

	if (gameField[clickedX][clickedY] != 98 && gameStarted)
	{
		if (evt.currentTarget.children.length == 0)
		{
			let tempEl = document.createElement("i");
			tempEl.classList.add("bx", "bxs-flag");
			evt.currentTarget.appendChild(tempEl);
			chickenCounter--;
		} else {
			chickenCounter++;
			evt.currentTarget.removeChild(evt.currentTarget.firstChild);
		}
		chickenCountEl.firstElementChild.innerHTML = chickenCounter;
	}
	return false;
}

// this function functions both for starting the game and when the game has already started
function chickenCheck(evt) {
	let clickedX = parseInt(evt.currentTarget.dataset.x);
	let clickedY = parseInt(evt.currentTarget.dataset.y);

	if (gameOverStatus)
		return;

	if (!gameStarted)
	{
		let filledTiles = 0;
		
		// fill the surrounding 8 tiles with empty tiles, this is the guarenteed starting block, if there's 9 or less available tiles due to the amount of bombs, there will be no starting block
		if (width * height - Math.round((width * height) / 100 * odds) - 9 < 1)
		{
			gameField[clickedX][clickedY] = 99;
			filledTiles = 1;
		} else
		{
			filledTiles = fillSurround(clickedX, clickedY);
		}
		// console.log(gameField);

		let chickenCount = Math.round((width * height) / 100 * odds);
		chickenCounter = initialCounter = chickenCount;

		chickenCountEl.firstElementChild.innerHTML = chickenCounter;
		
		// odds of tile being filled with chicken adjusted with unavailable tiles
		let adjustedOdds = chickenCount / (width * height - filledTiles) / 4;

		while (chickenCount > 0)
		{
			// console.log("loop");
			for (let x = 0; x < gameField.length; x++)
			{
				for (let y = 0; y < gameField[0].length; y++)
				{
					// console.log(`${x}, ${y}`);
					if (gameField[x][y] == 99 || gameField[x][y] == 1) continue;
					if (Math.random() >= adjustedOdds) continue;
					gameField[x][y] = 1;
					// field.children[x].children[y].style.backgroundColor = "red";
					chickenCount--;
					if (chickenCount < 1) { break; }
				}
				if (chickenCount < 1) { break; }
			}
			if (chickenCount < 1) { break; }
		}
		startTime = new Date().getTime();
		// console.log(startTime);
		timerInterval = setInterval(function() {step();}, 2);

		gameStarted = true;
	}
	// console.log(`${clickedX}, ${clickedY}`);
	// console.log(gameField[clickedX][clickedY]);

	// console.log(field.children[clickedX].children[clickedY].children.length);

	if (field.children[clickedX].children[clickedY].children.length < 1)
	{
		if (gameField[clickedX][clickedY] == 1)
		{
			// field.children[clickedX].children[clickedY].style.backgroundColor = "red";
			gameOver();
			// game over
		} else if (gameField[clickedX][clickedY] != 98)
			findEmpty(clickedX, clickedY);
	}
	if (clearedCounter + initialCounter == width * height)
		win();
}

function step() {
	passedTime = new Date().getTime() - startTime;

	timerEl.firstElementChild.innerHTML = msToTime(passedTime);

}

function msToTime(ms) {
	let milliseconds = Math.floor(ms % 1000),
		seconds = Math.floor((ms / 1000) % 60),
		minutes = Math.floor((ms / (1000 * 60)) % 60),
		hours = Math.floor((ms / (1000 * 60 * 60)));

	milliseconds = milliseconds < 100 ? milliseconds < 10 ? milliseconds < 1 ? "000" : "00" + milliseconds : "0" + milliseconds : milliseconds;

	if (hours < 1)
	{
		if (minutes < 1)
		{
			return `${seconds}.${milliseconds}`;
		} else {
			seconds = seconds < 10 ? "0" + seconds : seconds;
			return `${minutes}:${seconds}.${milliseconds}`;
		}
	}
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;
	return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function win() {
	clearInterval(timerInterval);
	gameOverStatus = true;
	
	passedTime = passedTime ? passedTime : 0;
	
	gameOverEl.firstElementChild.innerHTML = `It took you ${msToTime(passedTime)} to cook the ${width} by ${height} chicken, which had ${odds}% non-edible waste in it`;
	gameOverEl.classList.toggle("hidden");

	let json = localStorage.getItem("leaderboard");
	let options = `${width}x${height}x${odds}`;

	if (json)
	{
		let leaderboard = JSON.parse(json);
		if (Object.keys(leaderboard).includes(options))
		{
			leaderboard[options].push(passedTime);
		} else {
			leaderboard = Object.assign({[options]: [passedTime]}, leaderboard)
		}
		localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
	} else {
		localStorage.setItem("leaderboard", JSON.stringify({[options]: [passedTime]}));
	}
}

function gameOver() {
	gameOverStatus = true;
	clearInterval(timerInterval);
	for (let x = 0; x < gameField.length; x++) {
		
		for (let y = 0; y < gameField[0].length; y++) {
			if (gameField[x][y] == 1)
			{
				field.children[x].children[y].style.backgroundColor = "red";
			}
		}
	}
	gameOverEl.firstElementChild.innerHTML = "It's fucking RAW! You died of salmonella!";
	gameOverEl.classList.toggle("hidden");

}

function findEmpty(startX, startY)
{
	stack.push([startX, startY]);
	gameField[startX][startY] = 98;

	while (stack.length > 0)
	{
		let point = stack.pop();
		let x = point[0],
		    y = point[1];

		// gameField[x][y] = 98;
		field.children[x].children[y].style.backgroundColor = "lightgray";

		let cCount = calcChickens(x, y);

		if (cCount == 0)
		{
			// no chicknes in surrounding tiles, check same thing for the surrounding tiles
			for (let i = -1; i < 2; i++)
			{
				// console.log(x + i);
				if (x + i < 0 || x + i >= gameField.length) continue;
				for (let j = -1; j < 2; j++)
				{
					// console.log(`${x + i}, ${y + j}`);
					if (!(y + j >= 0 && y + j < gameField[0].length) || (i == 0 && j == 0)) continue;
					if (gameField[x + i][y + j] != 98)
					{
						stack.push([x + i, y + j]);
						gameField[x + i][y + j] = 98;
						// console.log(`${x + i}, ${y + j}`);
					}
				}
			}
		} else {
			let tempEl = document.createElement("p");
		
			tempEl.innerHTML = cCount;
			field.children[x].children[y].appendChild(tempEl);
		}
		clearedCounter++;
	}
	// console.log(clearedCounter);
}

function calcChickens(x, y) {
	let counter = 0;
	for (let i = -1; i < 2; i++)
	{
		if (x + i >= 0 && x + i < gameField.length)
		{
			// console.log(x + i);
			for (let j = -1; j < 2; j++)
			{
				// console.log(`${x + i}, ${y + j}`);
				if (y + j >= 0 && y + j < gameField[0].length)
				{
					// console.log(`${x + i}, ${y + j}`);
					if (gameField[x + i][y + j] == 1)
						counter++;
				}
			}
		}
	}
	return counter;
}

// fills surrounding tiles with empty tiles
function fillSurround(x, y) {
	// console.log(`${x}, ${y}`);
	let counter = 0;
	for (let i = -1; i < 2; i++)
	{
		if (x + i < 0 || x + i >= gameField.length) continue;
		// console.log(x + i);
		for (let j = -1; j < 2; j++)
		{
			// console.log(`${x + i}, ${y + j}`);
			if (y + j >= 0 && y + j < gameField[0].length)
			{
				gameField[x + i][y + j] = 99;
				// field.children[x + i].children[y + j].style.backgroundColor = "blue";
				counter++;
			}
		}
	}
	return counter;
}