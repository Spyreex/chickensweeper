const timerEl = document.querySelector("div.timer");
const chickenCountEl = document.querySelector("div.chicken-counter");
const gameOverEl = document.querySelector("div.game-over");

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
	document.querySelector("div.start-screen").classList.toggle("hidden");
	document.querySelector("div.settings-screen").classList.toggle("hidden");
}

document.querySelector("button#leaderboard-button").onclick = function(event) {
	document.querySelector("div.start-screen").classList.toggle("hidden");
	document.querySelector("div.leaderboard").classList.toggle("hidden");
}

document.querySelector("button#start-button").onclick = function(event) {
	document.querySelector("div.settings-screen").classList.toggle("hidden");
	document.querySelector("div.game").classList.toggle("hidden");

	// retrieve input from input fields
	width = parseInt(document.querySelector("input#width").value);
	height = parseInt(document.querySelector("input#height").value);

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

function chickenCheck(evt) {
	let clickedX = parseInt(evt.currentTarget.dataset.x);
	let clickedY = parseInt(evt.currentTarget.dataset.y);

	if (gameOverStatus)
		return;

	if (!gameStarted)
	{
		let filledTiles = fillSurround(parseInt(clickedX), parseInt(clickedY));
		// console.log(gameField);

		odds = parseFloat(document.querySelector("input#odds").value);
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
					if (gameField[x][y] != 99 && gameField[x][y] != 1)
					{
						if (Math.random() < adjustedOdds)
						{
							gameField[x][y] = 1;
							// field.children[x].children[y].style.backgroundColor = "red";
							chickenCount--;
							if (chickenCount < 1) { break; }
						}
					}
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
	
	return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function win() {
	clearInterval(timerInterval);
	gameOverStatus = true;
	
	gameOverEl.firstElementChild.innerHTML = `It took you ${msToTime(passedTime)} to cook the ${width} by ${height} chicken, which had ${odds}% non-edible waste in it`;
	gameOverEl.classList.toggle("hidden");
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
	gameOverEl.firstElementChild.innerHTML = "It's fucking RAW! You died to salmonella!";
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
				if (x + i >= 0 && x + i < gameField.length)
				{
					for (let j = -1; j < 2; j++)
					{
						// console.log(`${x + i}, ${y + j}`);
						if (y + j >= 0 && y + j < gameField[0].length && !(i == 0 && j == 0))
						{
							if (gameField[x + i][y + j] != 98)
							{
								stack.push([x + i, y + j]);
								gameField[x + i][y + j] = 98;
								// console.log(`${x + i}, ${y + j}`);
							}
						}
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

// deprecated function, recursion bad >:c
function findEmpty2(x, y) {
	let cCount = calcChickens(x, y);
	
	// if (gameField[x][y] == 98)
	//	return;

	gameField[x][y] = 98;
	field.children[x].children[y].style.backgroundColor = "lightgray";

	// check for no chickens in surrounding tiles
	if (cCount == 0)
	{
		// no chicknes in surrounding tiles, check same thing for the surrounding tiles
		for (let i = -1; i < 2; i++)
		{
			// console.log(x + i);
			if (x + i >= 0 && x + i < gameField.length)
			{
				for (let j = -1; j < 2; j++)
				{
					// console.log(`${x + i}, ${y + j}`);
					if (y + j >= 0 && y + j < gameField[0].length && !(i == 0 && j == 0))
					{
						if (gameField[x + i][y + j] != 98)
						{
							findEmpty2(x + i, y + j);

						}
						// console.log(`${x + i}, ${y + j}`);
						

					}
				}
			}
		}
	} else {
		let tempEl = document.createElement("p");
		
		tempEl.innerHTML = cCount;
		field.children[x].children[y].appendChild(tempEl);
	}
	clearedCounter++;
	// field.children[x].children[y].style.backgroundColor = "lightgray";
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

function fillSurround(x, y) {
	// console.log(`${x}, ${y}`);
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
					gameField[x + i][y + j] = 99;
					field.children[x + i].children[y + j].style.backgroundColor = "blue";
					counter++;
				}
			}
		}
	}
	return counter;
}